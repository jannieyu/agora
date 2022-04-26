package main

import (
	"agora/src/app/api"
	"agora/src/app/database"
	"agora/src/app/search"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	log "github.com/sirupsen/logrus"
	"net/http"
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

	h := api.New(index, db, sessions.NewCookieStore(key))
	r := mux.NewRouter()

	r.HandleFunc("/api/example", h.Authenticate)
	r.HandleFunc("/api/login", h.Login)
	r.HandleFunc("/api/logout", h.Logout)
	r.HandleFunc("/api/get_login_status", h.GetLoginStatus)
	r.HandleFunc("/api/add_item", h.AddItem)
	r.HandleFunc("/api/update_item", h.UpdateItem)
	r.HandleFunc("/api/delete_item", h.DeleteItem)
	r.HandleFunc("/api/get_search_items", h.GetSearchItems)
	r.HandleFunc("/api/add_bid", h.AddBid)
	r.HandleFunc("/api/get_bids", h.GetBids)
	r.HandleFunc("/api/add_bid_bot", h.AddBidBot)
	r.HandleFunc("/api/get_notifications", h.GetNotifications)
	r.HandleFunc("/api/update_seen_notifications", h.UpdateSeenNotifications)

	port := 8000
	log.Info("Server up and running on port " + fmt.Sprint(port))

	http.ListenAndServe(":"+fmt.Sprint(port), r)
}
