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

	isAuctionActive, err := IsAuctionActive(h.Db)
	if err != nil {
		log.WithError(err).Error("Failed to check if there exists an active auction while creating an auction.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if isAuctionActive {
		log.Error("Auction has already been created. Create new auction after current is disabled or ended.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	urlParams := r.URL.Query()["data"][0]
	payload := struct {
		StartTime string `json:"startTime"`
		EndTime   string `json:"endTime"`
	}{}
	if err = json.Unmarshal([]byte(urlParams), &payload); err != nil {
		log.WithError(err).Error("Failed to unmarshal auction info.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	auction, err := parseAndValidateTime(payload.StartTime, payload.EndTime)
	if err != nil {
		log.WithError(err).Error("Failed to parse time for auction start/end time.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if err = h.Db.Create(&auction).Error; err != nil {
		log.WithError(err).Error("Failed to add new auction to DB.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	go SetAuctionTimers(auction, h.Db, h.Hub)
	w.WriteHeader(http.StatusOK)
}

func parseAndValidateTime(startTimeString string, endTimeString string) (database.Auction, error) {
	iso8601 := "2006-01-02T15:04:05-0700"
	startTime, err := time.Parse(iso8601, startTimeString)
	if err != nil {
		return database.Auction{}, err
	}
	endTime, err := time.Parse(iso8601, endTimeString)
	if err != nil {
		return database.Auction{}, err
	}
	if startTime.Before(time.Now()) {
		return database.Auction{}, errors.New("Invalid start date; must start after current time.")
	}
	if endTime.Before(startTime) {
		return database.Auction{}, errors.New("Invalid start/end date; start date must come before end date.")
	}
	return database.Auction{
		StartTime: startTime,
		EndTime:   endTime,
	}, nil
}

func SetAuctionTimers(auction database.Auction, db *gorm.DB, hub *ws.Hub) {
	d := auction.StartTime.Sub(time.Now())
	time.Sleep(d)
	if err := initAuction(db, hub, &auction); err != nil {
		log.WithError(err).Error("Failed to init auction.")
	}
	log.Info("Started auction.")
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
		if err := item.CloseAuction(db, hub); err != nil {
			log.WithError(err).Error("Failed to close auction.")
		}
		log.Info("Closed auction.")
	}()
	return nil
}
