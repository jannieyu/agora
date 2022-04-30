package api

import (
	"agora/src/app/database"
	"agora/src/app/user"
	"encoding/json"
	"net/http"

	log "github.com/sirupsen/logrus"
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
	result := h.Db.Preload("Bids")
	result = user.PreloadSafeSellerInfo(result)
	if err := result.Where("id = ?", payload.ItemId).Find(&item).Error; err != nil {
		log.WithError(err).Error("Failed to query info info.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	SafeEncode(w, item)
}
