package bid

import (
	"agora/src/app/database"
	"agora/src/app/notification"
	"agora/src/app/ws"
	"errors"
	"fmt"
	"net/http"

	"github.com/shopspring/decimal"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func PlaceBid(bidderID uint32, itemID uint32, bidBotID uint32, bidPrice decimal.Decimal, db *gorm.DB, hub *ws.Hub) (int, error) {
	if isValidBidder, err := checkValidBidder(bidderID, itemID, db); err != nil {
		return http.StatusBadRequest, err
	} else if !isValidBidder {
		return http.StatusBadRequest, errors.New("Bidder cannot be the same as Seller.")
	}

	var item database.Item
	if err := db.First(&item, itemID).Error; err != nil {
		return http.StatusInternalServerError, err
	}
	if item.Active == false {
		return http.StatusBadRequest, errors.New("Invalid bid: Bid on inactive item.")
	}
	if err := checkValidBidIncrement(bidPrice.InexactFloat64(), item.HighestBid.InexactFloat64()); err != nil {
		return http.StatusBadRequest, errors.New("Invalid bid: must be higher than existing highest bid or starting price value.")
	}

	bid := database.Bid{
		BidderID: bidderID,
		ItemID:   itemID,
		BotID:    bidBotID,
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

	if err := CreateNotification(db, hub, database.Notification{
		ReceiverID: item.SellerID,
		SenderID:   bid.BidderID,
		ItemID:     bid.ItemID,
		Price:      bid.BidPrice,
		NoteType:   notification.ITEM_BID_ON,
	}); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

func CreateNotification(db *gorm.DB, hub *ws.Hub, note database.Notification) error {
	note.Seen = false
	if err := db.Create(&note).Error; err != nil {
		return err
	}
	if err := hub.BroadcastMessage([]uint32{note.ReceiverID}, ws.BroadcastAPI{
		BroadcastType: ws.NEW_NOTIFICATION}); err != nil {
		return err
	}
	return nil
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

			return errors.New(fmt.Sprintf("Bid must be at least %f", itemHighestBid+0.05))
		}
	case 1.00 <= itemHighestBid && itemHighestBid <= 4.99:
		if itemHighestBid+0.25 > bidPrice {
			return errors.New(fmt.Sprintf("Bid must be at least %f", itemHighestBid+0.25))
		}
	case 5.00 <= itemHighestBid && itemHighestBid <= 24.99:
		if itemHighestBid+0.50 > bidPrice {
			return errors.New(fmt.Sprintf("Bid must be at least %f", itemHighestBid+0.50))
		}
	case 25.00 <= itemHighestBid && itemHighestBid <= 99.99:
		if itemHighestBid+1.00 > bidPrice {
			return errors.New(fmt.Sprintf("Bid must be at least %f", itemHighestBid+1.00))
		}
	case 100.00 <= itemHighestBid && itemHighestBid <= 249.99:
		if itemHighestBid+2.50 > bidPrice {
			return errors.New(fmt.Sprintf("Bid must be at least %f", itemHighestBid+2.50))
		}
	case 250.00 <= itemHighestBid && itemHighestBid <= 499.99:
		if itemHighestBid+5.00 > bidPrice {
			return errors.New(fmt.Sprintf("Bid must be at least %f", itemHighestBid+5.00))
		}
	case 500.00 <= itemHighestBid && itemHighestBid <= 999.99:
		if itemHighestBid+10.00 > bidPrice {
			return errors.New(fmt.Sprintf("Bid must be at least %f", itemHighestBid+10.00))
		}
	case 1000.00 <= itemHighestBid && itemHighestBid <= 2499.99:
		if itemHighestBid+25.00 > bidPrice {
			return errors.New(fmt.Sprintf("Bid must be at least %f", itemHighestBid+25.00))
		}
	case 2500.00 <= itemHighestBid && itemHighestBid <= 4999.99:
		if itemHighestBid+50.00 > bidPrice {
			return errors.New(fmt.Sprintf("Bid must be at least %f", itemHighestBid+50.00))
		}
	default:
		if itemHighestBid+100.00 > bidPrice {
			return errors.New(fmt.Sprintf("Bid must be at least %f", itemHighestBid+100.00))
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

func getHighestBidOfItem(db *gorm.DB, itemId uint32) (database.Bid, error) {
	var bid database.Bid
	if err := db.Omit("bot_id").Where("item_id = ?", itemId).Order("bid_price desc").Find(&bid).Error; err != nil {
		return database.Bid{}, err
	}
	if bid.ID == 0 {
		return database.Bid{}, errors.New("Failed to find highest bid of item.")
	}
	return bid, nil
}

func BroadcastNewBid(hub *ws.Hub, db *gorm.DB, itemId uint32) error {
	newBid, err := getHighestBidOfItem(db, itemId)
	if err != nil {
		return err
	}
	if err := hub.BroadcastMessage([]uint32{}, ws.BroadcastAPI{
		BroadcastType: ws.NEW_BID,
		Data:          newBid,
	}); err != nil {
		return err
	}
	return nil
}
