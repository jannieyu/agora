package api

import (
	"agora/src/app/database"
	"agora/src/app/utils"
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"net/http"
)

func (h handle) UpdateItem(w http.ResponseWriter, r *http.Request) {
	session, err := h.store.Get(r, "user-auth")
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session.")
	}

	urlParams := r.URL.Query()["data"][0]
	var itemId uint32
	if err := json.Unmarshal([]byte(urlParams), &itemId); err != nil {
		log.WithError(err).Error("Failed to unmarshal payload.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	var item database.Item
	if err := h.db.First(&item, itemId).Error; err != nil {
		log.WithError(err).Error("Failed to find existing item entry in Items table.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	utils.PopulateItem(&item, r, session.Values["id"].(uint32))
	if err := h.db.Save(&item).Error; err != nil {
		log.WithError(err).Error("Failed to save item entry in Items table.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	safeEncode(w, "{}")
	log.Info("Completed item update.")
}
