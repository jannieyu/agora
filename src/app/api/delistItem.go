package api

import (
	"agora/src/app/bid"
	"agora/src/app/database"
	"agora/src/app/notification"
	"agora/src/app/user"
	"encoding/json"
	"fmt"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
	"net/http"
	"strconv"

	log "github.com/sirupsen/logrus"
)

func (h Handle) DelistItem(w http.ResponseWriter, r *http.Request) {
	sellerID, err := user.GetAuthorizedUserId(h.Store, r)
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session for login status check.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if sellerID == 0 {
		log.Error("Cannot add or update item to unauthenticated user.")
		w.WriteHeader(http.StatusForbidden)
		return
	}

	urlParams := r.URL.Query()["data"][0]
	payload := struct {
		ItemId uint32
	}{}
	if err := json.Unmarshal([]byte(urlParams), &payload); err != nil {
		log.WithError(err).Error("Failed to unmarshal item id for item deletion.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	var item database.Item
	if err := h.Db.First(&item, payload.ItemId).Error; err != nil {
		log.WithError(err).Error("Failed to find existing item entry in Items table.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if item.ID == 0 {
		log.Error(fmt.Sprintf("Failed to find item with id %d in database.", payload.ItemId))
		w.WriteHeader(http.StatusInternalServerError)
		return
	} else if item.SellerID != sellerID {
		log.WithError(err).Error("Cannot delist item; user doesn't match seller.")
		w.WriteHeader(http.StatusForbidden)
		return
	}

	item.Active = false
	if err := h.Db.Save(&item).Error; err != nil {
		log.WithError(err).Error("Failed to delete item entry in Items table.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if err := notifyDelistingToBidders(h.Db, item); err != nil {
		log.WithError(err).Error("Failed to notify bidders of item delisting.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if err := h.Index.Delete(strconv.FormatUint(uint64(item.ID), 10)); err != nil {
		log.WithError(err).Error("Failed to delete item index.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	SafeEncode(w, "{}")
	log.Info("Completed item deletion.")
}

func notifyDelistingToBidders(db *gorm.DB, item database.Item) error {
	var manualBids []database.Bid
	if err := db.Where("item_id = ? AND bot_id = ?", item.ID, 0).Find(&manualBids).Error; err != nil {
		return err
	}
	s := make(map[uint32]struct{})
	var exists = struct{}{}
	for _, b := range manualBids {
		if _, ok := s[b.BidderID]; !ok {
			if err := bid.CreateNotification(db, database.Notification{
				ReceiverID: b.BidderID,
				SenderID:   item.SellerID,
				ItemID:     item.ID,
				Price:      decimal.Decimal{},
				NoteType:   notification.ITEM_DELISTED}); err != nil {
				return err
			}
			s[b.BidderID] = exists
		}
	}

	var bidBots []database.BidBot
	if err := db.Where("item_id = ? AND active = ?", item.ID, true).Find(&bidBots).Error; err != nil {
		return err
	}
	for _, b := range bidBots {
		if _, ok := s[b.OwnerID]; !ok {
			if err := bid.CreateNotification(db, database.Notification{
				ReceiverID: b.OwnerID,
				SenderID:   item.SellerID,
				ItemID:     b.ItemID,
				Price:      decimal.Decimal{},
				NoteType:   notification.ITEM_DELISTED}); err != nil {
				return err
			}
		}
		if err := bid.CreateNotification(db, database.Notification{
			ReceiverID: b.OwnerID,
			SenderID:   item.SellerID,
			ItemID:     b.ItemID,
			Price:      decimal.Decimal{},
			NoteType:   notification.BIDBOT_DEACTIVATED + "_" + notification.ITEM_DELISTED}); err != nil {
			return err
		}
	}
	return nil
}
