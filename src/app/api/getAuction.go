package api

import (
	"agora/src/app/database"
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"net/http"
	"time"
)

//old
func (h Handle) GetAuctionStatus(w http.ResponseWriter, r *http.Request) {
	auction, err := GetMostRecentAuction(h.Db)
	if err != nil {
		log.WithError(err).Error("Failed to get auction status.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	SafeEncode(w, auction)
}

type AuctionStatus string

var (
	PAST_AUCTIONS     AuctionStatus = "pastAuc"
	CURRENT_AUCTION   AuctionStatus = "currAuc"
	UPCOMING_AUCTIONS AuctionStatus = "newAuc"
)

//new
func (h Handle) GetAuctions(w http.ResponseWriter, r *http.Request) {
	payload := struct {
		Status AuctionStatus
	}{}
	urlParams := r.URL.Query()["data"][0]
	if err := json.Unmarshal([]byte(urlParams), &payload); err != nil {
		log.WithError(err).Error("Failed to unmarshal bid information.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	auctions, err := GetCurrentAuction(h.Db, payload.Status)
	if err != nil {
		log.WithError(err).Error("Failed to get auction info from database.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	SafeEncode(w, auctions)
}

func GetMostRecentAuction(db *gorm.DB) (database.Auction, error) {
	var auction database.Auction
	if err := db.Limit(1).Order("id desc").Find(&auction).Error; err != nil {
		log.WithError(err).Error("Failed to get auction info from database.")
		return database.Auction{}, err
	}
	return auction, nil
}

func GetCurrentAuction(db *gorm.DB, status AuctionStatus) ([]database.Auction, error) {
	var auctions []database.Auction
	switch status {
	case PAST_AUCTIONS:
		if err := db.Where("end_time < ?", time.Now()).Find(&auctions).Error; err != nil {
			return auctions, err
		}
	case CURRENT_AUCTION:
		if err := db.Where("? BETWEEN start_time AND end_time", time.Now()).Find(&auctions).Error; err != nil {
			return auctions, err
		}
	case UPCOMING_AUCTIONS:
		if err := db.Where("start_time > ?", time.Now()).Find(&auctions).Error; err != nil {
			return auctions, err
		}
	}
	return auctions, nil
}

// TODO:
func IsAuctionActive(db *gorm.DB) (bool, error) {
	var auction database.Auction
	if err := db.Where("? BETWEEN start_time AND end_time", time.Now()).Find(&auction).Error; err != nil {
		log.WithError(err).Error("Failed to get auction info from database.")
		return false, err
	}
	//if err != nil {
	//	log.WithError(err).Error("Failed to get auction info when creating bidbot.")
	//	return false, err
	//}
	//if auction.EndTime.Before(time.Now()) || time.Now().Before(auction.StartTime) {
	//	return false, nil
	//}
	return auction.ID > 0, nil
}
