package api

import (
	"agora/src/app/database"
	"agora/src/app/utils"
	"encoding/json"
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

	if bidPrice.InexactFloat64() <= item.HighestBid.InexactFloat64() {
		http.Error(w, "Invalid bid: must be higher than existing highest bid or starting price value.", http.StatusBadRequest)
		return
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
