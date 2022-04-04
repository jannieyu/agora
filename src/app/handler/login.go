package handler

import (
	"encoding/json"
	"github.com/gorilla/sessions"
	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
	"net/http"
	"web/src/app/database"
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
			h.DB.Create(&user)
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
		session.Values["user_email"] = loginCredentials.Email
		session.Values["first_name"] = user.FirstName
		session.Values["last_name"] = user.LastName
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
	session.Values["user_email"] = ""
	if err := session.Save(r, w); err != nil {
		log.WithError(err).Error("Failed to save cookie session.")
	}

	log.Info("Successful logout of user.")
	SafeEncode(w, "{}")
}

func (h handler) GetLoginStatus(w http.ResponseWriter, r *http.Request) {
	session, err := h.store.Get(r, "user-auth")
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session for login status check.")
	}

	var status database.User
	if authenticated, ok := session.Values["authenticated"]; ok && authenticated.(bool) {
		log.Info("User is authenticated")
		user_email := session.Values["user_email"].(string)
		var user database.User
		if err := h.DB.Where("email = ?", user_email).Limit(1).Find(&user).Error; err != nil {
			log.WithError(err).Debug("Failed database query.")
		}
		status.Email = user.Email
		status.FirstName = user.FirstName
		status.LastName = user.LastName
	}
	SafeEncode(w, status)
}
