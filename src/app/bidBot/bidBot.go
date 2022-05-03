package bidBot

import (
	"agora/src/app/bid"
	"agora/src/app/database"
	"agora/src/app/notification"
	"agora/src/app/ws"
	"errors"
	"net/http"

	"github.com/shopspring/decimal"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func ValidateBidBot(db *gorm.DB, bidBot database.BidBot) (int, error) {
	var item database.Item
	if err := db.Where(&database.Item{ID: bidBot.ItemID}).Find(&item).Error; err != nil {
		log.WithError(err).Error("Failed to make query to get item of bid bot.")
		return http.StatusInternalServerError, err
	}

	if item.SellerID == bidBot.OwnerID {
		return http.StatusBadRequest, errors.New("Seller ID is same as Buyer ID.")
	}

	if bidBot.MaxBid.LessThanOrEqual(item.HighestBid) {
		return http.StatusBadRequest, errors.New("Max bid must be greater than highest bid.")
	}
	return http.StatusOK, nil
}

func runBotAgainstHighestBid(db *gorm.DB, hub *ws.Hub, bidBot *database.BidBot) (int, error) {
	var item database.Item
	if err := db.Where(&database.Item{ID: bidBot.ItemID}).Find(&item).Error; err != nil {
		log.WithError(err).Error("Failed to make query to get item of bid bot.")
		return http.StatusInternalServerError, err
	}

	prevHighestBid, err := GetPrevHighestBid(db, bidBot.ItemID)
	if err != nil {
		return http.StatusInternalServerError, err
	}
	if prevHighestBid.BidderID == bidBot.OwnerID {
		return http.StatusOK, err
	}

	inc, err := getBidBotIncrementPrice(db, bidBot.ItemID)
	if err != nil {
		return http.StatusInternalServerError, err
	}
	autoBidPrice := decimal.Min(item.HighestBid.Add(inc), bidBot.MaxBid)
	if statusCode, err := bid.PlaceBid(bidBot.OwnerID, bidBot.ItemID, bidBot.ID, autoBidPrice, db, hub); err != nil {
		log.WithError(err).Error("Failed to place bid for bid bot ", bidBot.ID)
		return statusCode, err
	}
	if err := bid.CreateNotification(db, hub, database.Notification{
		ReceiverID: prevHighestBid.BidderID,
		SenderID:   bidBot.OwnerID,
		ItemID:     bidBot.ItemID,
		Price:      autoBidPrice,
		NoteType:   notification.OUTBID,
	}); err != nil {
		return http.StatusInternalServerError, err
	}
	if err := bid.CreateNotification(db, hub, database.Notification{
		ReceiverID: bidBot.OwnerID,
		SenderID:   prevHighestBid.BidderID,
		ItemID:     bidBot.ItemID,
		Price:      autoBidPrice,
		NoteType:   notification.BIDBOT_BID}); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}
func RunManualBidAgainstBot(db *gorm.DB, hub *ws.Hub, itemId uint32, bidderID uint32, bidPrice decimal.Decimal) (int, bool, error) {
	var bidBots []database.BidBot
	if err := db.Where(&database.BidBot{ItemID: itemId, Active: true}).Find(&bidBots).Error; err != nil {
		log.WithError(err).Error("Failed to make query to get active bid bots for item.")
		return http.StatusInternalServerError, false, err
	}
	if len(bidBots) != 0 {
		bidBot := bidBots[0]
		inc, err := getBidBotIncrementPrice(db, bidBot.ItemID)
		if err != nil {
			return http.StatusInternalServerError, true, err
		}
		autoBidPrice := decimal.Min(bidPrice.Add(inc), bidBot.MaxBid)
		if autoBidPrice.GreaterThanOrEqual(bidPrice) {
			if bidBot.OwnerID != bidderID {
				if statusCode, err := bid.PlaceBid(bidBot.OwnerID, bidBot.ItemID, bidBot.ID, autoBidPrice, db, hub); err != nil {
					log.WithError(err).Error("Failed to place bid for bid bot ", bidBot.ID)
					return statusCode, true, err
				}
				err := bid.CreateNotification(db, hub, database.Notification{
					ReceiverID: bidderID,
					SenderID:   bidBot.OwnerID,
					ItemID:     bidBot.ItemID,
					Price:      autoBidPrice,
					NoteType:   notification.OUTBID})
				if err != nil {
					return http.StatusInternalServerError, true, err
				}
				err = bid.CreateNotification(db, hub, database.Notification{
					ReceiverID: bidBot.OwnerID,
					SenderID:   bidderID,
					ItemID:     bidBot.ItemID,
					Price:      autoBidPrice,
					NoteType:   notification.BIDBOT_BID})
				if err != nil {
					return http.StatusInternalServerError, true, err
				}
			}
		}
		if autoBidPrice.LessThanOrEqual(bidPrice) {
			if err := deactivateBidBot(db, hub, &bidBot, bidderID, bidPrice); err != nil {
				log.WithError(err).Error("Failed to deactivate bid bot ", bidBot.ID)
				return http.StatusBadRequest, true, err
			}
		}
	} else {
		return http.StatusOK, false, nil
	}
	return http.StatusOK, true, nil
}

func updateBidBotWinner(db *gorm.DB, hub *ws.Hub, loserBidBot *database.BidBot, winnerBidBot *database.BidBot) (int, error) {
	inc, err := getBidBotIncrementPrice(db, loserBidBot.ItemID)
	if err != nil {
		return http.StatusInternalServerError, err
	}
	autoBidPrice := decimal.Min(loserBidBot.MaxBid.Add(inc), winnerBidBot.MaxBid)
	if statusCode, err := bid.PlaceBid(loserBidBot.OwnerID, loserBidBot.ItemID, loserBidBot.ID, loserBidBot.MaxBid, db, hub); err != nil {
		log.WithError(err).Error("Failed to place bid for bid bot ", loserBidBot.ID)
		return statusCode, err
	}
	if err := bid.CreateNotification(db, hub, database.Notification{
		ReceiverID: loserBidBot.OwnerID,
		SenderID:   winnerBidBot.OwnerID,
		ItemID:     winnerBidBot.ItemID,
		Price:      loserBidBot.MaxBid,
		NoteType:   notification.BIDBOT_BID}); err != nil {
		return http.StatusInternalServerError, err
	}
	if err := deactivateBidBot(db, hub, loserBidBot, winnerBidBot.OwnerID, autoBidPrice); err != nil {
		log.WithError(err).Error("Failed to deactivate bid bot ", loserBidBot.ID)
		return http.StatusInternalServerError, err
	}
	if statusCode, err := bid.PlaceBid(winnerBidBot.OwnerID, winnerBidBot.ItemID, winnerBidBot.ID, autoBidPrice, db, hub); err != nil {
		log.WithError(err).Error("Failed to place bid for bid bot ", winnerBidBot.ID)
		return statusCode, err
	}
	if err := bid.CreateNotification(db, hub, database.Notification{
		ReceiverID: winnerBidBot.OwnerID,
		SenderID:   loserBidBot.OwnerID,
		ItemID:     winnerBidBot.ItemID,
		Price:      autoBidPrice,
		NoteType:   notification.BIDBOT_BID}); err != nil {
		return http.StatusInternalServerError, err
	}
	return http.StatusOK, nil
}

func updateBidBotTie(db *gorm.DB, hub *ws.Hub, loserBidBot *database.BidBot, winnerBidBot *database.BidBot) (int, error) {
	if statusCode, err := bid.PlaceBid(winnerBidBot.OwnerID, winnerBidBot.ItemID, winnerBidBot.ID, winnerBidBot.MaxBid, db, hub); err != nil {
		log.WithError(err).Error("Failed to place bid for bid bot")
		return statusCode, err
	}
	if err := bid.CreateNotification(db, hub, database.Notification{
		ReceiverID: winnerBidBot.OwnerID,
		SenderID:   loserBidBot.OwnerID,
		ItemID:     winnerBidBot.ItemID,
		Price:      winnerBidBot.MaxBid,
		NoteType:   notification.BIDBOT_BID}); err != nil {
		return http.StatusInternalServerError, err
	}
	if err := deactivateBidBot(db, hub, loserBidBot, winnerBidBot.OwnerID, winnerBidBot.MaxBid); err != nil {
		log.WithError(err).Error("Failed to deactivate bid bot")
		return http.StatusInternalServerError, err
	}
	if err := deactivateBidBot(db, hub, winnerBidBot, winnerBidBot.OwnerID, winnerBidBot.MaxBid); err != nil {
		log.WithError(err).Error("Failed to deactivate bid bot")
		return http.StatusInternalServerError, err
	}
	return http.StatusOK, nil
}

func RunBotAgainstBot(db *gorm.DB, hub *ws.Hub, newBidBot database.BidBot) (int, error) {
	var bidBots []database.BidBot
	if err := db.Where(&database.BidBot{ItemID: newBidBot.ItemID, Active: true}).Not(&database.BidBot{ID: newBidBot.ID}).Find(&bidBots).Error; err != nil {
		log.WithError(err).Error("Failed to make query to get active bid bots for item")
		return http.StatusInternalServerError, err
	}
	if len(bidBots) == 0 {
		if statusCode, err := runBotAgainstHighestBid(db, hub, &newBidBot); err != nil {
			log.WithError(err).Error("Error running bot against current highest bid on item.")
			return statusCode, err
		}
	} else {
		oldBidBot := bidBots[0]
		if oldBidBot.MaxBid.GreaterThan(newBidBot.MaxBid) {
			return updateBidBotWinner(db, hub, &newBidBot, &oldBidBot)
		} else if oldBidBot.MaxBid.Equal(newBidBot.MaxBid) {
			return updateBidBotTie(db, hub, &newBidBot, &oldBidBot)
		} else {
			return updateBidBotWinner(db, hub, &oldBidBot, &newBidBot)
		}
	}
	return http.StatusOK, nil

}

func deactivateBidBot(db *gorm.DB, hub *ws.Hub, bidBot *database.BidBot, newHighestBidderId uint32, newHighestBid decimal.Decimal) error {
	bidBot.Active = false
	if err := db.Save(&bidBot).Error; err != nil {
		return err
	}
	if err := createBidBotDeactivateNotification(db, hub, bidBot, newHighestBidderId, newHighestBid); err != nil {
		return err
	}
	log.Info("Deactivated bid bot ", bidBot.ID)
	return nil
}

func createBidBotDeactivateNotification(db *gorm.DB, hub *ws.Hub, bidBot *database.BidBot, newHighestBidderId uint32, newHighestBid decimal.Decimal) error {
	notification := database.Notification{
		ReceiverID: bidBot.OwnerID,
		SenderID:   newHighestBidderId,
		ItemID:     bidBot.ItemID,
		Price:      newHighestBid,
		NoteType:   notification.BIDBOT_DEACTIVATED,
	}
	if err := db.Create(&notification).Error; err != nil {
		return err
	}
	if err := hub.BroadcastMessage([]uint32{notification.ReceiverID}, ws.BroadcastAPI{ws.NEW_NOTIFICATION}); err != nil {
		return err
	}
	return nil
}

func getBidBotIncrementPrice(db *gorm.DB, itemID uint32) (decimal.Decimal, error) {
	var item database.Item
	if err := db.First(&item, itemID).Error; err != nil {
		return decimal.Decimal{}, err
	}
	itemHighestBid := item.HighestBid

	switch {
	case itemHighestBid.LessThan(decimal.NewFromFloat(0.01)):
		return decimal.Decimal{}, errors.New("Highest bid price is less than 0.01.")
	case itemHighestBid.GreaterThanOrEqual(decimal.NewFromFloat(0.01)) &&
		itemHighestBid.LessThanOrEqual(decimal.NewFromFloat(0.99)):
		return decimal.NewFromFloat(0.05), nil
	case itemHighestBid.GreaterThanOrEqual(decimal.NewFromFloat(1.00)) &&
		itemHighestBid.LessThanOrEqual(decimal.NewFromFloat(4.99)):
		return decimal.NewFromFloat(0.25), nil
	case itemHighestBid.GreaterThanOrEqual(decimal.NewFromFloat(5.00)) &&
		itemHighestBid.LessThanOrEqual(decimal.NewFromFloat(24.99)):
		return decimal.NewFromFloat(0.50), nil
	case itemHighestBid.GreaterThanOrEqual(decimal.NewFromFloat(25.00)) &&
		itemHighestBid.LessThanOrEqual(decimal.NewFromFloat(99.99)):
		return decimal.NewFromFloat(1.00), nil
	case itemHighestBid.GreaterThanOrEqual(decimal.NewFromFloat(100.00)) &&
		itemHighestBid.LessThanOrEqual(decimal.NewFromFloat(249.99)):
		return decimal.NewFromFloat(2.00), nil
	case itemHighestBid.GreaterThanOrEqual(decimal.NewFromFloat(250.00)) &&
		itemHighestBid.LessThanOrEqual(decimal.NewFromFloat(449.99)):
		return decimal.NewFromFloat(5.00), nil
	case itemHighestBid.GreaterThanOrEqual(decimal.NewFromFloat(500.00)) &&
		itemHighestBid.LessThanOrEqual(decimal.NewFromFloat(999.99)):
		return decimal.NewFromFloat(10.00), nil
	case itemHighestBid.GreaterThanOrEqual(decimal.NewFromFloat(1000.00)) &&
		itemHighestBid.LessThanOrEqual(decimal.NewFromFloat(2499.99)):
		return decimal.NewFromFloat(25.00), nil
	case itemHighestBid.GreaterThanOrEqual(decimal.NewFromFloat(2500.00)) &&
		itemHighestBid.LessThanOrEqual(decimal.NewFromFloat(4999.99)):
		return decimal.NewFromFloat(50.00), nil

	default:
		return decimal.NewFromFloat(100.00), nil
	}
}

func GetPrevHighestBid(db *gorm.DB, itemId uint32) (database.Bid, error) {
	var prevHighestBid database.Bid
	if err := db.Where(database.Bid{ItemID: itemId}).Order("created_at desc").Limit(1).Find(&prevHighestBid).Error; err != nil {
		return database.Bid{}, err
	}
	return prevHighestBid, nil
}
