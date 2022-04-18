package api

import (
	"agora/src/app/database"
	"agora/src/app/utils"
	"encoding/json"
	"errors"
	"fmt"
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

	if isValidBidder, err := checkValidBidder(bidderID, bidAPI.ItemID, h.Db); err != nil {
		log.WithError(err).Error("Failed to check if bidder id is valid.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	} else if isValidBidder == false {
		log.WithError(err).Error("Invalid bid: bidder ID equals seller ID.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	bidPrice, err := utils.ConvertStringPriceToDecimal(bidAPI.BidPrice)
	if err != nil {
		log.WithError(err).Error("Failed to parse bid price value.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	var item database.Item
	if err := h.Db.First(&item, bidAPI.ItemID).Error; err != nil {
		log.WithError(err).Error("Failed to select highest bid from existing item entry in Items table.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if err := checkValidBidIncrement(bidPrice.InexactFloat64(), item.HighestBid.InexactFloat64()); err != nil {
		log.WithError(err).Error("Invalid bid increment.")
		w.WriteHeader(http.StatusBadRequest)
	}

	bid := database.Bid{
		BidderID: bidderID,
		ItemID:   bidAPI.ItemID,
		BidPrice: bidPrice,
	}
	if err := h.Db.Create(&bid).Error; err != nil {
		log.WithError(err).Error("Failed to add new bid to database.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	item.HighestBid = bidPrice
	item.NumBids += 1
	if err := h.Db.Save(&item).Error; err != nil {
		log.WithError(err).Error("Failed to save item entry in Items table.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	SafeEncode(w, "{}")
	log.Info("Completed bid upload.")
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
	case itemHighestBid <= 0.01:
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
