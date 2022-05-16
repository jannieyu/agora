package api

import (
	"agora/src/app/database"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"net/http"
)

func (h Handle) GetAuctionStatus(w http.ResponseWriter, r *http.Request) {
	auction, err := GetAuction(h.Db)
	if err != nil {
		log.WithError(err).Error("Failed to get auction status.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	SafeEncode(w, auction)
}

func GetAuction(db *gorm.DB) (database.Auction, error) {
	var auction database.Auction
	if err := db.Where("id = ?", 1).Find(&auction).Error; err != nil {
		log.WithError(err).Error("Failed to get auction info from database.")
		return database.Auction{}, err
	}
	return auction, nil
}
