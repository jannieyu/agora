package api

import (
	"agora/src/app/database"
	"encoding/json"
	"net/http"

	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func (h Handle) GetBids(w http.ResponseWriter, r *http.Request) {
	urlParams := r.URL.Query()["data"][0]
	payload := struct {
		itemId uint32
	}{}
	if err := json.Unmarshal([]byte(urlParams), &payload); err != nil {
		log.WithError(err).Error("Failed to unmarshal item id for getting item bids.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	var bids []database.Bid
	result := h.Db
	result = result.Preload("Bidder", func(tx *gorm.DB) *gorm.DB {
		return tx.Select("id", "first_name", "last_name")
	})
	if err := result.Select("bid_price", "bidder_id", "created_at").Where(&database.Bid{ItemID: payload.itemId}).Find(&bids).Error; err != nil {
		log.WithError(err).Error("Failed to make query to get item bids.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	SafeEncode(w, bids)
}
