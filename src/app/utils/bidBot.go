package utils

import (
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

func RunBidBots(db *gorm.DB, itemId uint32, currMaxBid decimal.Decimal) error {
	//var bidBots []database.BidBot
	//if err := db.Where(&database.BidBot{ItemID: itemId}).Find(&bidBots).Error; err != nil {
	//	return err
	//}
	//
	//for _, bot := range bidBots {
	//	autoBidPrice := ((bot.MaxBid.Sub(currMaxBid)).Div(bot.Increment)).Floor()
	//	bid := database.Bid{
	//		BidderID: bot.OwnerID,
	//		ItemID:   itemId,
	//		BidPrice: autoBidPrice,
	//	}
	//	if err := db.Create(&bid).Error; err != nil {
	//		log.WithError(err).Error("Failed to add new bid to database.")
	//		w.WriteHeader(http.StatusInternalServerError)
	//		return
	//	}
	//}
	return nil
}
