package api

import (
	"agora/src/app/database"
	u "agora/src/app/user"
	"encoding/json"
	"net/http"

	"github.com/gorilla/sessions"
	log "github.com/sirupsen/logrus"
)

func (h Handle) Login(w http.ResponseWriter, r *http.Request) {
	session, err := h.Store.Get(r, "user-auth")
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session at login.")
	}
	session.Options = &sessions.Options{SameSite: http.SameSiteStrictMode}
	urlParams := r.URL.Query()["data"][0]
	var loginCredentials u.LoginCredentialsAPI
	if err := json.Unmarshal([]byte(urlParams), &loginCredentials); err != nil {
		log.WithError(err).Error("Failed to unmarshal login credentials.")
		w.WriteHeader(http.StatusBadRequest)
		SafeEncode(w, "{}")
	}

	var user database.User
	if err := h.Db.Where(&database.User{Email: loginCredentials.Email}).Limit(1).Find(&user).Error; err != nil {
		log.WithError(err).Debug("Failed database query.")
	}

	userExists := user.ID > 0
	userAuthenticated := false

	if loginCredentials.IsSignUp {
		if userExists {
			w.WriteHeader(http.StatusBadRequest)
			SafeEncode(w, "{}")
		} else {
			hash, err := u.HashPassword(loginCredentials.Password)
			if err != nil {
				log.WithError(err).Error("Failed to hash passcode.")
			}

			user = database.User{
				FirstName: loginCredentials.FirstName,
				LastName:  loginCredentials.LastName,
				Email:     loginCredentials.Email,
				Pword:     hash,
			}
			if err := h.Db.Create(&user).Error; err != nil {
				log.WithError(err).Error("Failed to add new user to database.")
			}
			userAuthenticated = true
		}
	} else {
		if userExists {
			userAuthenticated = u.CheckPasswordHash(loginCredentials.Password, user.Pword)
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
		status.ID = user.ID

		var count int64
		if err = h.Db.Model(&database.Notification{}).Where(
			"seen = ? and receiver_id = ?", false, user.ID,
		).Count(&count).Error; err != nil {
			log.WithError(err).Error("Failed to get count of unseen notifications from database.")
			w.WriteHeader(http.StatusInternalServerError)
		}

		var auction database.Auction
		auction, err = GetMostRecentAuction(h.Db)

		response := u.LoginStatusAPI{
			User:    status,
			Count:   count,
			Auction: auction,
		}

		SafeEncode(w, response)

		log.Info("Successful authentication of user.")

	} else {
		log.Info("Unauthorized user login.")
		w.WriteHeader(http.StatusUnauthorized)
		SafeEncode(w, "{}")
	}
}
