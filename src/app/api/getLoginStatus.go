package api

import (
	"agora/src/app/database"
	u "agora/src/app/user"
	"net/http"

	"github.com/gorilla/sessions"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func getUser(db *gorm.DB, store *sessions.CookieStore, r *http.Request) (database.User, error) {
	session, err := store.Get(r, "user-auth")
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session for login status check.")
		return database.User{}, err
	}

	id, err := u.GetAuthorizedUserId(store, r)
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
		User:    user,
		Count:   count,
		Auction: auction,
	}

	SafeEncode(w, response)
}
