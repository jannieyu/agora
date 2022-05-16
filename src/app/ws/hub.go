package ws

import (
	"encoding/json"

	log "github.com/sirupsen/logrus"
)

type BroadcastType string

const (
	NEW_NOTIFICATION BroadcastType = "NEW_NOTIFICATION"
	NEW_BID          BroadcastType = "NEW_BID"
	UPDATE_ITEM      BroadcastType = "UPDATE_ITEM"
	AUCTION_END      BroadcastType = "AUCTION_END"
)

type WSMessage struct {
	UserIds []uint32
	Message []byte
}

type BroadcastAPI struct {
	BroadcastType BroadcastType `json:"broadcastType"`
	Data          any           `json:"data,omitempty"`
}

// Hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	// Registered clients.
	clients map[uint32]map[*Client]bool

	// Inbound messages from the clients.
	Broadcast chan []byte

	// Register requests from the clients.
	Register chan *Client

	// Unregister requests from clients.
	unregister chan *Client
}

func NewHub() *Hub {
	return &Hub{
		Broadcast:  make(chan []byte),
		Register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[uint32]map[*Client]bool),
	}
}

func (h *Hub) BroadcastMessage(userIds []uint32, message any) error {
	m, err := json.Marshal(message)
	if err != nil {
		return err
	}
	b := WSMessage{
		UserIds: userIds,
		Message: m,
	}
	finalMessage, err := json.Marshal(b)
	if err != nil {
		return err
	}
	h.Broadcast <- finalMessage
	return nil
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			if _, ok := h.clients[client.UserId]; !ok {
				h.clients[client.UserId] = map[*Client]bool{}
			}
			h.clients[client.UserId][client] = true
		case client := <-h.unregister:
			if _, ok := h.clients[client.UserId][client]; ok {
				delete(h.clients[client.UserId], client)
				if len(h.clients[client.UserId]) == 0 {
					delete(h.clients, client.UserId)
				}
				close(client.Send)
			}
		case message := <-h.Broadcast:
			var b WSMessage
			if err := json.Unmarshal(message, &b); err != nil {
				log.WithError(err).Info("Failed to unmarshall the message")
			}
			var users []uint32
			if len(b.UserIds) == 0 {
				r := make([]uint32, 0, len(h.clients))
				for k := range h.clients {
					r = append(r, k)
				}
				users = r
			} else {
				users = b.UserIds
			}
			for _, userId := range users {
				for client := range h.clients[userId] {
					select {
					case client.Send <- b.Message:
					default:
						close(client.Send)
						delete(h.clients[userId], client)
						if len(h.clients[client.UserId]) == 0 {
							delete(h.clients, client.UserId)
						}
					}
				}
			}
		}
	}
}
