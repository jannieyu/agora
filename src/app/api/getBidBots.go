package api

import (
	"agora/src/app/database"
	"agora/src/app/user"
	"github.com/shopspring/decimal"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"net/http"
)

type BidBotAPI struct {
	ID             uint32          `json:"id,omitempty" gorm:"primarykey"`
	ItemID         uint32          `json:"itemId,omitempty"`
	ItemName       string          `json:"itemName,omitempty"`
	ItemImage      string          `json:"itemImage,omitempty"`
	HighestItemBid decimal.Decimal `json:"highestItemBid,omitempty"`
	MaxBid         decimal.Decimal `json:"maxBid,omitempty" gorm:"type:decimal(6,2);"`
	HighestBotBid  decimal.Decimal `json:"highestBotBid,omitempty"`
	Active         bool            `json:"active,omitempty"`
}

func (h Handle) GetBidBots(w http.ResponseWriter, r *http.Request) {
	bidderId, err := user.GetAuthorizedUserId(h.Store, r)
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session when authorized user id.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if bidderId == 0 {
		log.Error("Cannot access user bids without login.")
		w.WriteHeader(http.StatusForbidden)
		return
	}
	var result []database.BidBot

	if err := h.Db.Model(&database.BidBot{}).Preload("Bids", func(tx *gorm.DB) *gorm.DB {
		return tx.Order("bids.id DESC")
	}).Order("active DESC").Find(&result).Error; err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	var payload []BidBotAPI
	for _, r := range result {
		item := struct {
			Name       string
			Image      string
			HighestBid decimal.Decimal
		}{}
		if err := h.Db.Model(&database.Item{}).Select(
			"name, image, highest_bid").Where(
			"id = ?", r.ItemID).Find(&item).Error; err != nil {
		}
		bot := BidBotAPI{
			ID:             r.ID,
			ItemID:         r.ItemID,
			ItemName:       item.Name,
			ItemImage:      item.Image,
			HighestItemBid: item.HighestBid,
			MaxBid:         r.MaxBid,
			Active:         r.Active,
		}
		if len(r.Bids) > 0 {
			bot.HighestBotBid = r.Bids[0].BidPrice
		}
		payload = append(payload, bot)
	}
	SafeEncode(w, payload)
}
