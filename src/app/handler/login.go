package handler

import (
	"agora/src/app/database"
	"encoding/json"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/shopspring/decimal"
	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	log.Debug("Failure on checking password hash.", err)
	return err == nil
}

func processImage(r *http.Request) (string, error) {
	r.ParseMultipartForm(10 << 20)
	file, header, err := r.FormFile("photo")
	if err != nil {
		log.WithError(err).Debug("No photo given from request.")
		return "", nil
	}
	data, err := ioutil.ReadAll(file)
	if err != nil {
		return "", err
	}
	defer func(file multipart.File) {
		err := file.Close()
		if err != nil {
			log.WithError(err).Error("Failed to close photo file.")
		}
	}(file)
	if err := ioutil.WriteFile("images/"+header.Filename, data, 0777); err != nil {
		return "", err
	}
	return header.Filename, nil
}

func populateItem(item *database.Item, r *http.Request, sellerID uint32) error {
	item.Name = r.FormValue("name")
	item.Category = r.FormValue("category")
	item.Condition = r.FormValue("condition")
	item.Description = r.FormValue("description")
	item.SellerID = sellerID

	if price := r.FormValue("price"); !strings.EqualFold(price, "") {
		item_price, err := decimal.NewFromString(price)
		if err != nil {
			log.WithError(err).Debug("Failed to parse string price.")
		}
		item.Price = item_price
	}

	if image_location, err := processImage(r); err != nil {
		log.WithError(err).Debug("Failed to process image.")
	} else {
		item.Image = image_location
	}

	return nil
}

func getUser(db *gorm.DB, store *sessions.CookieStore, r *http.Request) (database.User, error) {
	session, err := store.Get(r, "user-auth")
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session for login status check.")
		return database.User{}, err
	}
	var user database.User
	if authenticated, ok := session.Values["authenticated"]; ok && authenticated.(bool) {
		if err := db.First(&user, session.Values["id"].(uint32)).Error; err != nil {
			log.WithError(err).Error("Failed to find existing item entry in Items table.")
			return database.User{}, err
		}
		user.Pword = ""
	}
	return user, nil
}

/* TODO: Untouched. Clean up or remove. */
func (h handler) Authenticate(w http.ResponseWriter, r *http.Request) {
	session, _ := h.store.Get(r, "user-auth")

	// Check if user is authenticated
	if auth, ok := session.Values["authenticated"].(bool); !ok || !auth {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	} else {
		urlParams := r.URL.Query()["data"]
		log.Debug(urlParams)
		SafeEncode(w, urlParams[0])
	}
}

func (h handler) Login(w http.ResponseWriter, r *http.Request) {
	session, err := h.store.Get(r, "user-auth")
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session at login.")
	}
	session.Options = &sessions.Options{SameSite: http.SameSiteStrictMode}

	urlParams := r.URL.Query()["data"][0]
	var loginCredentials loginCredentials
	if err := json.Unmarshal([]byte(urlParams), &loginCredentials); err != nil {
		log.WithError(err).Error("Failed to unmarshal login credentials.")
		w.WriteHeader(http.StatusBadRequest)
		SafeEncode(w, "{}")
	}

	var user database.User
	if err := h.DB.Where("email = ?", loginCredentials.Email).Limit(1).Find(&user).Error; err != nil {
		log.WithError(err).Debug("Failed database query.")
	}

	userExists := user.ID > 0
	userAuthenticated := false

	if loginCredentials.IsSignUp {
		if userExists {
			w.WriteHeader(http.StatusBadRequest)
			SafeEncode(w, "{}")
		} else {
			hash, err := hashPassword(loginCredentials.Password)
			if err != nil {
				log.WithError(err).Error("Failed to hash passcode.")
			}

			user = database.User{
				FirstName: loginCredentials.FirstName,
				LastName:  loginCredentials.LastName,
				Email:     loginCredentials.Email,
				Pword:     hash,
			}
			if err := h.DB.Create(&user).Error; err != nil {
				log.WithError(err).Error("Failed to add new user to database.")
			}
			userAuthenticated = true
		}
	} else {
		if userExists {
			userAuthenticated = checkPasswordHash(loginCredentials.Password, user.Pword)
		}
	}

	var status database.User
	if userAuthenticated {
		// Authentication was successful!
		session.Values["authenticated"] = true
		session.Values["id"] = user.ID
		if err := session.Save(r, w); err != nil {
			log.WithError(err).Error("Failed to save cookie session.")
		}

		status.Email = user.Email
		status.FirstName = user.FirstName
		status.LastName = user.LastName
		log.Info("Successful authentication of user.")

	} else {
		log.Info("Unauthorized user login.")
		w.WriteHeader(http.StatusUnauthorized)
		SafeEncode(w, "{}")
	}
	SafeEncode(w, status)
}

func (h handler) Logout(w http.ResponseWriter, r *http.Request) {
	session, err := h.store.Get(r, "user-auth")
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session at logout.")
	}
	session.Options = &sessions.Options{SameSite: http.SameSiteStrictMode}

	// Revoke users authentication
	session.Values["authenticated"] = false
	session.Values["id"] = 0
	if err := session.Save(r, w); err != nil {
		log.WithError(err).Error("Failed to save cookie session.")
	}

	log.Info("Successful logout of user.")
	w.WriteHeader(http.StatusOK)
	SafeEncode(w, "{}")
}

func (h handler) GetLoginStatus(w http.ResponseWriter, r *http.Request) {
	user, err := getUser(h.DB, h.store, r)
	if err != nil {
		log.WithError(err).Error("Failed to get user from database.")
		w.WriteHeader(http.StatusInternalServerError)
	}
	SafeEncode(w, user)
}

func (h handler) AddItem(w http.ResponseWriter, r *http.Request) {
	session, err := h.store.Get(r, "user-auth")
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session at logout.")
	}
	var item database.Item
	if err := populateItem(&item, r, session.Values["id"].(uint32)); err != nil {
		log.WithError(err).Error("Failed to parse item data.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if err := h.DB.Create(&item).Error; err != nil {
		log.WithError(err).Error("Failed to add new item to database.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusCreated)
	SafeEncode(w, "{}")
	log.Info("Completed item upload.")
}

func (h handler) UpdateItem(w http.ResponseWriter, r *http.Request) {
	session, err := h.store.Get(r, "user-auth")
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session at logout.")
	}

	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var item database.Item
	if err := h.DB.First(&item, id).Error; err != nil {
		log.WithError(err).Error("Failed to find existing item entry in Items table.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	populateItem(&item, r, session.Values["id"].(uint32))
	if err := h.DB.Save(&item).Error; err != nil {
		log.WithError(err).Error("Failed to save item entry in Items table.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	SafeEncode(w, "{}")
	log.Info("Completed item update.")
}

func (h handler) DeleteItem(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])
	var item database.Item
	if err := h.DB.First(&item, id).Error; err != nil {
		log.WithError(err).Error("Failed to find existing item entry in Items table.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if err := h.DB.Delete(&item).Error; err != nil {
		log.WithError(err).Error("Failed to delete item entry in Items table.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode("{}")
	log.Info("Completed item deletion.")
}
