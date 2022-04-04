package main

import (
	"fmt"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	log "github.com/sirupsen/logrus"
	"net/http"
	"web/src/app/database"
	"web/src/app/handler"
)

var (
	// Key must be 16, 24 or 32 bytes long (AES-128, AES-192 or AES-256)
	// Should be something like:
	// var Store = sessions.NewCookieStore([]byte(os.Getenv("SESSION_KEY")))
	key = []byte("super-secret-key")
)

func main() {
	db := database.Init()
	h := handler.New(db, sessions.NewCookieStore(key))

	r := mux.NewRouter()
	r.HandleFunc("/api/example", h.Authenticate)
	r.HandleFunc("/api/login", h.Login)
	r.HandleFunc("/api/logout", h.Logout)
	r.HandleFunc("/api/get_login_status", h.GetLoginStatus)

	port := 8000
	log.Info("Server up and running on port " + fmt.Sprint(port))
	http.ListenAndServe(":"+fmt.Sprint(port), r)
}
