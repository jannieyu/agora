package api

import (
	"agora/src/app/database"
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"net/http"
)

func isValidBidBot(db *gorm.DB, ownerID uint32) (bool, error) {
	var bid database.Bid
	if err := db.Where(&database.Bid{BidderID: ownerID}).Limit(1).Find(&bid).Error; err != nil {
		log.WithError(err).Error("Failed database query.")
		return false, err
	}
	return bid.BidderID > 0, nil
}

func (h Handle) AddBidBot(w http.ResponseWriter, r *http.Request) {
	session, err := h.Store.Get(r, "user-auth")
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session at logout.")
	}
	ownerID := session.Values["id"].(uint32)

	if isValid, err := isValidBidBot(h.Db, ownerID); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	} else if isValid == false {
		http.Error(w, "Cannot create bid bot without initating at least 1 bid for item.", http.StatusForbidden)
		return
	}

	urlParams := r.URL.Query()["data"][0]
	var bidBot database.BidBot
	if err := json.Unmarshal([]byte(urlParams), &bidBot); err != nil {
		log.WithError(err).Error("Failed to unmarshal bid bot information.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	bidBot.OwnerID = ownerID
}
