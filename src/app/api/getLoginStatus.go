package api

import (
	"agora/src/app/database"
	"github.com/gorilla/sessions"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"net/http"
)

func getUser(db *gorm.DB, store *sessions.CookieStore, r *http.Request) (database.User, error) {
	session, err := store.Get(r, "user-auth")
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session for login status check.")
		return database.User{}, err
	}
	var user database.User
	if authenticated, ok := session.Values["authenticated"]; ok && authenticated.(bool) {
		if err := db.First(&user, session.Values["id"].(uint32)).Error; err != nil {
			log.WithError(err).Error("Failed to make query to User table.")
			return database.User{}, err
		}
		user.Pword = ""
	}
	return user, nil
}

func (h Handle) GetLoginStatus(w http.ResponseWriter, r *http.Request) {
	user, err := getUser(h.Db, h.Store, r)
	if err != nil {
		log.WithError(err).Error("Failed to get user from database.")
		w.WriteHeader(http.StatusInternalServerError)
	}
	SafeEncode(w, user)
}
