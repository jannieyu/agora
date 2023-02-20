package main

import (
	"agora/src/app/api"
	"agora/src/app/database"
	"agora/src/app/search"
	"agora/src/app/ws"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	log "github.com/sirupsen/logrus"
)

var (
	// Key must be 16, 24 or 32 bytes long (AES-128, AES-192 or AES-256)
	// Should be something like:
	// var store = sessions.NewCookieStore([]byte(os.Getenv("SESSION_KEY")))
	key = []byte("super-secret-key")
)

func main() {
	db, err := database.Init()
	if err != nil {
		log.WithError(err).Fatal("Cannot start database.")
		panic(err)
	}
	index, err := search.Init(db)
	if err != nil {
		log.WithError(err).Fatal("Cannot create index file.")
	}

	hub := ws.NewHub()
	go hub.Run()

	h := api.New(index, db, hub, sessions.NewCookieStore(key))

	auction, err := api.GetMostRecentAuction(db)
	if err != nil {
		log.WithError(err).Fatal("Cannot retrieve auction info from database.")
	}
	if auction.ID != 0 {
		if time.Now().Before(auction.EndTime) {
			go api.SetAuctionTimers(auction, db, hub)
		}
	}

	r := mux.NewRouter()

	r.HandleFunc("/api/ws", h.Ws)

	r.HandleFunc("/api/example", h.Authenticate)
	r.HandleFunc("/api/login", h.Login)
	r.HandleFunc("/api/logout", h.Logout)
	r.HandleFunc("/api/get_login_status", h.GetLoginStatus)
	r.HandleFunc("/api/get_user", h.GetUser)
	r.HandleFunc("/api/update_user", h.UpdateUser)
	r.HandleFunc("/api/get_user_history", h.GetUserHistory)

	r.HandleFunc("/api/record_item_click", h.RecordItemClick)
	r.HandleFunc("/api/get_item", h.GetItem)
	r.HandleFunc("/api/add_item", h.AddOrUpdateItem)
	r.HandleFunc("/api/delist_item", h.DelistItem)
	r.HandleFunc("/api/get_search_items", h.GetSearchItems)

	r.HandleFunc("/api/bid", h.AddBid)
	r.HandleFunc("/api/get_bids", h.GetBids)

	r.HandleFunc("/api/add_bid_bot", h.AddOrUpdateBidBot)
	r.HandleFunc("/api/get_bid_bots", h.GetBidBots)

	r.HandleFunc("/api/get_notifications", h.GetNotifications)
	r.HandleFunc("/api/update_seen_notifications", h.UpdateSeenNotifications)

	r.HandleFunc("/api/create_auction", h.CreateAuction)
	r.HandleFunc("/api/get_auction", h.GetAuctionStatus)

	port := 8000
	log.Info("Server up and running on port " + fmt.Sprint(port))

	http.ListenAndServe(":"+fmt.Sprint(port), r)

}
