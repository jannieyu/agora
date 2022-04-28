package api

import (
	"agora/src/app/database"
	u "agora/src/app/user"
	log "github.com/sirupsen/logrus"
	"net/http"
)

func (h Handle) UpdateUser(w http.ResponseWriter, r *http.Request) {
	loginUserId, err := u.GetAuthorizedUserId(h.Store, r)
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session when authorized user id.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if loginUserId == 0 {
		log.Error("Cannot update user info without login.")
		w.WriteHeader(http.StatusForbidden)
		return
	}
	var user database.User
	if err := h.Db.Where("id = ?", loginUserId).Limit(1).Find(&user).Error; err != nil {
		log.WithError(err).Error("Failed to retrieve existing user from database.")
	}
	if err := u.PopulateUser(&user, r); err != nil {
		log.WithError(err).Error("Failed to update user data.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if err := h.Db.Save(&user).Error; err != nil {
		log.WithError(err).Error("Failed to save updated user data.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	SafeEncode(w, "{}")
	log.Info("Completed user update.")
}
