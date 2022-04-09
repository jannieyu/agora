package api

import (
	"agora/src/app/database"
	"agora/src/app/utils"
	log "github.com/sirupsen/logrus"
	"net/http"
)

func (h handle) AddItem(w http.ResponseWriter, r *http.Request) {
	session, err := h.store.Get(r, "user-auth")
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session at logout.")
	}
	var item database.Item
	if err := utils.PopulateItem(&item, r, session.Values["id"].(uint32)); err != nil {
		log.WithError(err).Error("Failed to parse item data.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if err := h.db.Create(&item).Error; err != nil {
		log.WithError(err).Error("Failed to add new item to database.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusCreated)
	safeEncode(w, "{}")
	log.Info("Completed item upload.")
}
