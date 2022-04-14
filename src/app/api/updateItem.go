package api

import (
	"agora/src/app/database"
	"agora/src/app/utils"
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"net/http"
	"strconv"
)

func (h Handle) UpdateItem(w http.ResponseWriter, r *http.Request) {
	session, err := h.Store.Get(r, "user-auth")
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
	if err := h.Db.First(&item, itemId).Error; err != nil {
		log.WithError(err).Error("Failed to find existing item entry in Items table.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	utils.PopulateItem(&item, r, h.Index, session.Values["id"].(uint32))
	if err := h.Db.Save(&item).Error; err != nil {
		log.WithError(err).Error("Failed to save item entry in Items table.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if err := h.Index.Index(strconv.FormatUint(uint64(item.ID), 10), item); err != nil {
		log.WithError(err).Error("Failed to index item.")
	}

	w.WriteHeader(http.StatusOK)
	SafeEncode(w, "{}")
	log.Info("Completed item update.")
}
