package utils

import (
	"agora/src/app/database"
	"errors"
	"github.com/shopspring/decimal"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"net/http"
)

func PlaceBid(bidderID uint32, itemID uint32, bidPrice decimal.Decimal, db *gorm.DB) (int, error) {
	if isValidBidder, err := checkValidBidder(bidderID, itemID, db); err != nil {
		return http.StatusBadRequest, err
	} else if !isValidBidder {
		return http.StatusBadRequest, errors.New("Bidder cannot be the same as Seller.")
	}

	var item database.Item
	if err := db.First(&item, itemID).Error; err != nil {
		return http.StatusInternalServerError, err
	}

	if bidPrice.InexactFloat64() <= item.HighestBid.InexactFloat64() {
		return http.StatusBadRequest, errors.New("Invalid bid: must be higher than existing highest bid or starting price value.")
	}

	bid := database.Bid{
		BidderID: bidderID,
		ItemID:   itemID,
		BidPrice: bidPrice,
	}
	if err := db.Create(&bid).Error; err != nil {
		return http.StatusInternalServerError, err
	}

	updateMaxBid(&item, bidPrice)
	updateNumBid(&item)
	if err := db.Save(&item).Error; err != nil {
		return http.StatusInternalServerError, err

	}

	return 0, nil
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

func updateNumBid(item *database.Item) {
	item.NumBids += 1
}
