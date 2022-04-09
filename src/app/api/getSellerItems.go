package api

import (
	"agora/src/app/database"
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"net/http"
)

func (h handle) GetSellerItems(w http.ResponseWriter, r *http.Request) {
	session, err := h.store.Get(r, "user-auth")
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session when retrieving seller items.")
	}
	seller_id := session.Values["id"].(uint32)
	items := []database.Item{}
	result := h.db.Where(&database.Item{SellerID: seller_id}).Find(&items)
	if result.Error != nil {
		log.WithError(result.Error).Error("Failed to make query to get seller items.")
		w.WriteHeader(http.StatusInternalServerError)
	} else {
		w.WriteHeader(http.StatusOK)
	}
	json.NewEncoder(w).Encode(result)
}
