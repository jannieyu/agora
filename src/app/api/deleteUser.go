package api

import (
	"agora/src/app/database"
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"net/http"
)

func (h handle) DeleteUser(w http.ResponseWriter, r *http.Request) {
	session, err := h.store.Get(r, "user-auth")
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session at logout.")
	}

	var user database.User
	if err := h.db.First(&user, session.Values["id"].(uint32)).Error; err != nil {
		log.WithError(err).Error("Failed to find existing user entry in Users table.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if err := h.db.Delete(&user).Error; err != nil {
		log.WithError(err).Error("Failed to delete user entry in Users table.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode("{}")
	log.Info("Completed user deletion.")
}
