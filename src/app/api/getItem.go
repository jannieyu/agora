package api

import (
	"agora/src/app/database"
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"net/http"
)

func (h Handle) GetItem(w http.ResponseWriter, r *http.Request) {
	urlParams := r.URL.Query()["data"][0]
	payload := struct {
		ItemId uint32
	}{}
	if err := json.Unmarshal([]byte(urlParams), &payload); err != nil {
		log.WithError(err).Error("Failed to unmarshal item id while getting item.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	var item []database.Item
	if err := h.Db.Where("id = ?", payload.ItemId).Find(&item).Error; err != nil {
		log.WithError(err).Error("Failed to query info info.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	SafeEncode(w, item)
}
