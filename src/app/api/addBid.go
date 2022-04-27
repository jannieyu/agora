package api

import (
	"agora/src/app/bid"
	"agora/src/app/bidBot"
	"agora/src/app/database"
	"agora/src/app/item"
	"agora/src/app/notification"
	"encoding/json"
	"net/http"

	log "github.com/sirupsen/logrus"
)

func (h Handle) AddBid(w http.ResponseWriter, r *http.Request) {
	session, err := h.Store.Get(r, "user-auth")
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session at logout.")
	}
	bidderID := session.Values["id"].(uint32)

	urlParams := r.URL.Query()["data"][0]
	var bidAPI bid.BidAPI
	if err := json.Unmarshal([]byte(urlParams), &bidAPI); err != nil {
		log.WithError(err).Error("Failed to unmarshal bid information.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	bidPrice, err := item.ConvertStringPriceToDecimal(bidAPI.BidPrice)
	if err != nil {
		log.WithError(err).Error("Failed to parse bid price data.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	prevHighestBid, err := bidBot.GetPrevHighestBid(h.Db, bidAPI.ItemID)
	if err != nil {
		log.WithError(err).Error("Failed to retrieve previous highest bid on item.")
		w.WriteHeader(http.StatusInternalServerError)
	}

	if statusCode, err := bid.PlaceBid(bidderID, bidAPI.ItemID, 0, bidPrice, h.Db); err != nil {
		log.WithError(err).Error("Failed to place bid.")
		w.WriteHeader(statusCode)
		return
	}

	statusCode, existingBot, err := bidBot.RunManualBidAgainstBot(h.Db, bidAPI.ItemID, bidderID, bidPrice)
	if err != nil {
		log.WithError(err).Error("Failed to run manual bid against bots.")
		w.WriteHeader(statusCode)
		return
	}
	if !existingBot {
		if prevHighestBid.ID > 0 && prevHighestBid.BidderID != bidderID {
			if err := bid.CreateNotification(h.Db, database.Notification{
				ReceiverID: prevHighestBid.BidderID,
				SenderID:   bidderID,
				ItemID:     bidAPI.ItemID,
				Price:      bidPrice,
				NoteType:   notification.OUTBID,
			}); err != nil {
				log.WithError(err).Error("Failed to create new notification.")
				w.WriteHeader(http.StatusInternalServerError)
			}
		}
	}

	w.WriteHeader(http.StatusCreated)
	SafeEncode(w, "{}")
	log.Info("Completed bid upload.")
}
