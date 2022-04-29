package api

import (
	"agora/src/app/database"
	u "agora/src/app/user"
	log "github.com/sirupsen/logrus"
	"net/http"
)

func (h Handle) GetUser(w http.ResponseWriter, r *http.Request) {
	loginUserId, err := u.GetAuthorizedUserId(h.Store, r)
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session when authorized user id.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if loginUserId == 0 {
		log.Error("Cannot get user info without login.")
		w.WriteHeader(http.StatusForbidden)
		return
	}
	var result []database.User
	if err := h.Db.Model(&database.User{}).Select("first_name", "last_name", "email", "image", "bio").Where(
		"id = ?", loginUserId).Find(&result).Error; err != nil {
		log.WithError(err).Error("Failed to query user info.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	SafeEncode(w, result)
}
