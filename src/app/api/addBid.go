package api

import (
	"agora/src/app/database"
	"agora/src/app/utils"
	"encoding/json"
	"errors"
	"github.com/shopspring/decimal"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"net/http"
)

func (h Handle) AddBid(w http.ResponseWriter, r *http.Request) {
	session, err := h.Store.Get(r, "user-auth")
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session at logout.")
	}
	bidderID := session.Values["id"].(uint32)

	urlParams := r.URL.Query()["data"][0]
	var bidAPI utils.BidAPI
	if err := json.Unmarshal([]byte(urlParams), &bidAPI); err != nil {
		log.WithError(err).Error("Failed to unmarshal bid information.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusCreated)
	SafeEncode(w, "{}")
	log.Info("Completed bid upload.")
}

func placeBid(bidderID uint32, itemID uint32, bidPriceString string, db *gorm.DB) error {

	if isValidBidder, err := checkValidBidder(bidderID, itemID, db); err != nil {
		return err
	} else if isValidBidder == false {
		return err
	}

	bidPrice, err := utils.ConvertStringPriceToDecimal(bidPriceString)
	if err != nil {
		return err
	}

	var item database.Item
	if err := db.First(&item, itemID).Error; err != nil {
		return err
	}

	if bidPrice.InexactFloat64() <= item.HighestBid.InexactFloat64() {
		return errors.New("Invalid bid: must be higher than existing highest bid or starting price value.")
	}

	bid := database.Bid{
		BidderID: bidderID,
		ItemID:   itemID,
		BidPrice: bidPrice,
	}
	if err := db.Create(&bid).Error; err != nil {
		return err
	}

	updateMaxBid(&item, bidPrice)
	if err := db.Save(&item).Error; err != nil {
		return err
	}
}

func checkValidBidder(bidderID uint32, itemID uint32, db *gorm.DB) (bool, error) {
	var item database.Item
	if err := db.Select("seller_id").Where("id = ?", itemID).Find(&item).Error; err != nil {
		log.WithError(err).Error("Failed to retrieve seller id of item.")
		return false, err
	}
	return bidderID != item.SellerID, nil
}

func updateMaxBid(item *database.Item, maxBid decimal.Decimal) {
	item.HighestBid = maxBid
}
