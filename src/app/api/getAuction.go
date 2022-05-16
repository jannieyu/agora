package api

import (
	"agora/src/app/database"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"net/http"
	"time"
)

func (h Handle) GetAuctionStatus(w http.ResponseWriter, r *http.Request) {
	auction, err := GetMostRecentAuction(h.Db)
	if err != nil {
		log.WithError(err).Error("Failed to get auction status.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	SafeEncode(w, auction)
}

func GetMostRecentAuction(db *gorm.DB) (database.Auction, error) {
	var auction database.Auction
	if err := db.Limit(1).Order("id desc").Find(&auction).Error; err != nil {
		log.WithError(err).Error("Failed to get auction info from database.")
		return database.Auction{}, err
	}
	return auction, nil
}

func IsAuctionActive(db *gorm.DB) (bool, error) {
	auction, err := GetMostRecentAuction(db)
	if err != nil {
		log.WithError(err).Error("Failed to get auction info when creating bidbot.")
		return false, err
	}
	if auction.EndTime.Before(time.Now()) || time.Now().Before(auction.StartTime) {
		return false, nil
	}
	return true, nil
}
