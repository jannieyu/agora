package api

import (
	"agora/src/app/bid"
	"agora/src/app/bidBot"
	"agora/src/app/item"
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"net/http"
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

	if statusCode, err := bid.PlaceBid(bidderID, bidAPI.ItemID, bidPrice, h.Db); err != nil {
		log.WithError(err).Error("Failed to place bid.")
		w.WriteHeader(statusCode)
		return
	}

	if statusCode, err := bidBot.RunManualBidAgainstBot(h.Db, bidAPI.ItemID, bidPrice); err != nil {
		log.WithError(err).Error("Failed to run manual bid against bots.")
		w.WriteHeader(statusCode)
		return
	}

	w.WriteHeader(http.StatusCreated)
	SafeEncode(w, "{}")
	log.Info("Completed bid upload.")
}
