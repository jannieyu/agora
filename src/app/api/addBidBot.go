package api

import (
	"agora/src/app/bidBot"
	"agora/src/app/database"
	"agora/src/app/item"
	"encoding/json"
	"net/http"

	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func (h Handle) AddOrUpdateBidBot(w http.ResponseWriter, r *http.Request) {
	session, err := h.Store.Get(r, "user-auth")
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session at logout.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	ownerID := session.Values["id"].(uint32)

	urlParams := r.URL.Query()["data"][0]
	var bidBotAPI bidBot.BidBotAPI
	if err := json.Unmarshal([]byte(urlParams), &bidBotAPI); err != nil {
		log.WithError(err).Error("Failed to unmarshal bid bot information.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	bot, err := populateBidBot(bidBotAPI, ownerID)
	if err != nil {
		log.WithError(err).Error("Failed to populate bid bot info.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if statusCode, err := bidBot.ValidateBidBot(h.Db, bot); err != nil {
		log.WithError(err).Error("Invalid bid bot.")
		w.WriteHeader(statusCode)
		return
	}

	hasExistingAndActiveBidBot, bidBotId, err := ownerHasExistingAndActiveBidBotOnItem(h.Db, ownerID, bidBotAPI.ItemID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	bot.ID = bidBotId
	if err := h.Db.Save(&bot).Error; err != nil {
		log.WithError(err).Error("Failed to update bid bot to database.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if !hasExistingAndActiveBidBot {
		if statusCode, err := bidBot.RunBotAgainstBot(h.Db, bot); err != nil {
			log.WithError(err).Error("Error running bot against bot.")
			w.WriteHeader(statusCode)
			return
		}
	}

	log.Info("Created or updated new bid bot.")
	w.WriteHeader(http.StatusOK)
	SafeEncode(w, "{}")
}

func populateBidBot(bidBotAPI bidBot.BidBotAPI, ownerId uint32) (database.BidBot, error) {
	maxBid, err := item.ConvertStringPriceToDecimal(bidBotAPI.MaxBid)
	if err != nil {
		return database.BidBot{}, err
	}
	bot := database.BidBot{
		OwnerID: ownerId,
		ItemID:  bidBotAPI.ItemID,
		MaxBid:  maxBid,
		Active:  true,
	}
	return bot, nil
}

func ownerHasExistingAndActiveBidBotOnItem(db *gorm.DB, ownerId uint32, itemId uint32) (bool, uint32, error) {
	var bot database.BidBot
	if err := db.Where(&database.BidBot{OwnerID: ownerId, ItemID: itemId}).Limit(1).Find(&bot).Error; err != nil {
		log.WithError(err).Error("Failed database query.")
		return false, 0, err
	}
	return bot.ID > 0 && bot.Active, bot.ID, nil
}
