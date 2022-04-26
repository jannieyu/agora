package api

import (
	"agora/src/app/database"
	"agora/src/app/user"
	"github.com/shopspring/decimal"
	log "github.com/sirupsen/logrus"
	"net/http"
)

type ItemBidsAPI struct {
	ID             uint32          `json:"itemId,omitempty"`
	Name           string          `json:"itemName,omitempty"`
	Image          string          `json:"itemImage,omitempty"`
	HighestBid     decimal.Decimal `json:"highestItemBid,omitempty"`
	HighestUserBid decimal.Decimal `json:"highestUserBid,omitempty"`
}

func (h Handle) GetBids(w http.ResponseWriter, r *http.Request) {
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
	var result []ItemBidsAPI
	if err := h.Db.Model(&database.Bid{}).Select(
		"items.id, "+
			"items.name, "+
			"items.highest_bid, "+
			"items.image, "+
			"max(bids.bid_price) as highest_user_bid").Group(
		"items.id").Joins(
		"left join items on items.id = bids.item_id").Where(
		"bids.bidder_id = ?", bidderId).Find(&result).Error; err != nil {
		log.WithError(err).Error("Failed to query user bid items.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	SafeEncode(w, result)
}
