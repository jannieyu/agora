package api

import (
	"agora/src/app/database"
	"agora/src/app/item"
	"agora/src/app/user"
	"agora/src/app/ws"
	"encoding/json"
	"errors"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"net/http"
	"time"
)

func (h Handle) CreateAuction(w http.ResponseWriter, r *http.Request) {
	userId, err := user.GetAuthorizedUserId(h.Store, r)
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session when authorized user id.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if userId != 1 {
		log.Error("Cannot initiate auction without admin account.")
		w.WriteHeader(http.StatusForbidden)
		return
	}

	var auction database.Auction
	if err := h.Db.Where("id = ?", 1).Find(&auction).Error; err != nil {
		log.WithError(err).Error("Failed to get auction info from database.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if auction.ID != 0 {
		log.Error("Auction has already been created. Cannot create two auctions at the same time.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	urlParams := r.URL.Query()["data"][0]
	payload := struct {
		StartTime string `json:"startTime"`
		EndTime   string `json:"endTime"`
	}{}
	if err := json.Unmarshal([]byte(urlParams), &payload); err != nil {
		log.WithError(err).Error("Failed to unmarshal auction info.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	auction, err = parseAndValidateTime(payload.StartTime, payload.EndTime)
	if err != nil {
		log.WithError(err).Error("Failed to parse time for auction start/end time.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	go func() {
		d := auction.StartTime.Sub(time.Now())
		time.Sleep(d)
		err := initAuction(h.Db, h.Hub, &auction)
		if err != nil {
			log.WithError(err).Error("Failed to init auction.")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
	}()
}

func parseAndValidateTime(startTimeString string, endTimeString string) (database.Auction, error) {
	log.Info(startTimeString, endTimeString)

	iso8601 := "2006-01-02T15:04:05-0700"
	startTime, err := time.Parse(iso8601, startTimeString)
	if err != nil {
		return database.Auction{}, err
	}
	endTime, err := time.Parse(iso8601, endTimeString)
	if err != nil {
		return database.Auction{}, err
	}
	if startTime.Sub(time.Now()) < 0 {
		return database.Auction{}, errors.New("Invalid start date; must start after current time.")
	}
	if endTime.Sub(startTime) < 0 {
		return database.Auction{}, errors.New("Invalid start/end date; start date must come before end date.")
	}
	return database.Auction{
		StartTime: startTime,
		EndTime:   endTime,
	}, nil
}

func initAuction(db *gorm.DB, hub *ws.Hub, auction *database.Auction) error {
	if time.Now().Before(auction.StartTime) {
		return errors.New("Cannot init auction; has not started yet. " +
			"Expect current time to be after auction start time.")
	}
	d := auction.EndTime.Sub(time.Now())
	if d < 0 {
		return errors.New("Invalid end date; must end after start date.")
	}
	go func() {
		time.Sleep(d)
		err := item.CloseAuction(db, hub)
		if err != nil {
			log.WithError(err).Error("Failed to close auction.")
			panic(err)
		}
	}()
	return nil
}
