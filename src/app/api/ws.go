package api

import (
	"agora/src/app/user"
	"agora/src/app/ws"
	"github.com/gorilla/sessions"
	log "github.com/sirupsen/logrus"
	"net/http"
)

// serveWs handles websocket requests from the peer.
func ServeWs(hub *ws.Hub, store *sessions.CookieStore, w http.ResponseWriter, r *http.Request) {
	userId, err := user.GetAuthorizedUserId(store, r)
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session for login status check.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	conn, err := ws.Upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.WithError(err).Error("Failed to update the client connection.")
		return
	}
	client := &ws.Client{Hub: hub, Conn: conn, UserId: userId, Send: make(chan []byte, 256)}
	client.Hub.Register <- client

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.WritePump()
	go client.ReadPump()

}

func (h Handle) Ws(w http.ResponseWriter, r *http.Request) {
	ServeWs(h.Hub, h.Store, w, r)
}
