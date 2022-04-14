package api

import (
	"agora/src/app/database"
	"agora/src/app/utils"
	log "github.com/sirupsen/logrus"
	"net/http"
)

func (h Handle) updateUser(w http.ResponseWriter, r *http.Request) {
	var user database.User
	if err := utils.PopulateUser(&user, r); err != nil {
		log.WithError(err).Error("Failed to update user data.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusCreated)
	SafeEncode(w, "{}")
	log.Info("Completed user update.")
}
