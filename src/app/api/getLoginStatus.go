package api

import (
	"agora/src/app/database"
	"agora/src/app/user"
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

	id, err := user.GetAuthorizedUserId(store, r)
	if err != nil {
		return database.User{}, err
	}
	var activeUser database.User
	if authenticated, ok := session.Values["authenticated"]; ok && authenticated.(bool) {
		if err := db.Where("id = ?", id).Limit(1).Find(&activeUser).Error; err != nil {
			log.WithError(err).Error("Failed to make query to User table.")
			return database.User{}, err
		}
		activeUser.Pword = ""
	}
	return activeUser, nil
}

func (h Handle) GetLoginStatus(w http.ResponseWriter, r *http.Request) {
	user, err := getUser(h.Db, h.Store, r)
	if err != nil {
		log.WithError(err).Error("Failed to get user from database.")
		w.WriteHeader(http.StatusInternalServerError)
	}
	SafeEncode(w, user)
}
