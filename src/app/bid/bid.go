package bid

import (
	"agora/src/app/database"
	"errors"
	"fmt"
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

	if err := checkValidBidIncrement(bidPrice.InexactFloat64(), item.HighestBid.InexactFloat64()); err != nil {
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

func checkValidBidIncrement(bidPrice float64, itemHighestBid float64) error {
	switch {
	case itemHighestBid < 0.01:
		return errors.New("Highest bid price is less than 0.01.")
	case 0.01 <= itemHighestBid && itemHighestBid <= 0.99:
		if itemHighestBid+0.05 > bidPrice {

			return errors.New(fmt.Sprintf("Bid must be at least %d", itemHighestBid+0.05))
		}
	case 1.00 <= itemHighestBid && itemHighestBid <= 4.99:
		if itemHighestBid+0.25 > bidPrice {
			return errors.New(fmt.Sprintf("Bid must be at least %d", itemHighestBid+0.25))
		}
	case 5.00 <= itemHighestBid && itemHighestBid <= 24.99:
		if itemHighestBid+0.50 > bidPrice {
			return errors.New(fmt.Sprintf("Bid must be at least %d", itemHighestBid+0.50))
		}
	case 25.00 <= itemHighestBid && itemHighestBid <= 99.99:
		if itemHighestBid+1.00 > bidPrice {
			return errors.New(fmt.Sprintf("Bid must be at least %d", itemHighestBid+1.00))
		}
	case 100.00 <= itemHighestBid && itemHighestBid <= 249.99:
		if itemHighestBid+2.50 > bidPrice {
			return errors.New(fmt.Sprintf("Bid must be at least %d", itemHighestBid+2.50))
		}
	case 250.00 <= itemHighestBid && itemHighestBid <= 499.99:
		if itemHighestBid+5.00 > bidPrice {
			return errors.New(fmt.Sprintf("Bid must be at least %d", itemHighestBid+5.00))
		}
	case 500.00 <= itemHighestBid && itemHighestBid <= 999.99:
		if itemHighestBid+10.00 > bidPrice {
			return errors.New(fmt.Sprintf("Bid must be at least %d", itemHighestBid+10.00))
		}
	case 1000.00 <= itemHighestBid && itemHighestBid <= 2499.99:
		if itemHighestBid+25.00 > bidPrice {
			return errors.New(fmt.Sprintf("Bid must be at least %d", itemHighestBid+25.00))
		}
	case 2500.00 <= itemHighestBid && itemHighestBid <= 4999.99:
		if itemHighestBid+50.00 > bidPrice {
			return errors.New(fmt.Sprintf("Bid must be at least %d", itemHighestBid+50.00))
		}
	default:
		if itemHighestBid+100.00 > bidPrice {
			return errors.New(fmt.Sprintf("Bid must be at least %d", itemHighestBid+100.00))
		}
	}
	return nil
}

func updateMaxBid(item *database.Item, maxBid decimal.Decimal) {
	item.HighestBid = maxBid
}

func updateNumBid(item *database.Item) {
	item.NumBids += 1
}
