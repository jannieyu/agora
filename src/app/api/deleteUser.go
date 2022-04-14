package api

import (
	"agora/src/app/database"
	"net/http"

	log "github.com/sirupsen/logrus"
)

func (h Handle) DeleteUser(w http.ResponseWriter, r *http.Request) {
	session, err := h.Store.Get(r, "user-auth")
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session at logout.")
	}
	var user database.User
	if err := h.Db.First(&user, session.Values["id"].(uint32)).Error; err != nil {
		log.WithError(err).Error("Failed to find existing user entry in Users table.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if err := h.Db.Delete(&user).Error; err != nil {
		log.WithError(err).Error("Failed to delete user entry in Users table.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	SafeEncode(w, "{}")
	w.WriteHeader(http.StatusOK)

	log.Info("Completed user deletion.")
}
