package api

import (
	"agora/src/app/database"
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"net/http"
)

func (h Handle) AddBidBot(w http.ResponseWriter, r *http.Request) {
	session, err := h.Store.Get(r, "user-auth")
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session at logout.")
	}
	ownerID := session.Values["id"].(uint32)

	urlParams := r.URL.Query()["data"][0]
	var bidBot database.BidBot
	if err := json.Unmarshal([]byte(urlParams), &bidBot); err != nil {
		log.WithError(err).Error("Failed to unmarshal bid bot information.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	bidBot.OwnerID = ownerID
}
