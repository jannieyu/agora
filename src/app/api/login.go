package api

import (
	"agora/src/app/database"
	"agora/src/app/utils"
	"encoding/json"
	"github.com/gorilla/sessions"
	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
	"net/http"
)

func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	log.Debug("Failure on checking password hash.", err)
	return err == nil
}

func (h handle) Login(w http.ResponseWriter, r *http.Request) {
	session, err := h.store.Get(r, "user-auth")
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session at login.")
	}
	session.Options = &sessions.Options{SameSite: http.SameSiteStrictMode}

	urlParams := r.URL.Query()["data"][0]
	var loginCredentials utils.LoginCredentials
	if err := json.Unmarshal([]byte(urlParams), &loginCredentials); err != nil {
		log.WithError(err).Error("Failed to unmarshal login credentials.")
		w.WriteHeader(http.StatusBadRequest)
		safeEncode(w, "{}")
	}

	var user database.User
	if err := h.db.Where(&database.User{Email: loginCredentials.Email}).Limit(1).Find(&user).Error; err != nil {
		log.WithError(err).Debug("Failed database query.")
	}

	userExists := user.ID > 0
	userAuthenticated := false

	if loginCredentials.IsSignUp {
		if userExists {
			w.WriteHeader(http.StatusBadRequest)
			safeEncode(w, "{}")
		} else {
			hash, err := utils.HashPassword(loginCredentials.Password)
			if err != nil {
				log.WithError(err).Error("Failed to hash passcode.")
			}

			user = database.User{
				FirstName: loginCredentials.FirstName,
				LastName:  loginCredentials.LastName,
				Email:     loginCredentials.Email,
				Pword:     hash,
			}
			if err := h.db.Create(&user).Error; err != nil {
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
		safeEncode(w, "{}")
	}
	safeEncode(w, status)
}
