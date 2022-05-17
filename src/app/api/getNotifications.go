package api

import (
	"agora/src/app/database"
	"agora/src/app/notification"
	"agora/src/app/user"
	"net/http"

	"github.com/shopspring/decimal"
	log "github.com/sirupsen/logrus"
)

type NotificationAPI struct {
	ID         uint32            `json:"id,omitempty"`
	ReceiverID uint32            `json:"receiverId,omitempty"`
	SenderID   uint32            `json:"senderId,omitempty"`
	ItemID     uint32            `json:"itemId,omitempty"`
	Name       string            `json:"itemName"`
	FirstName  string            `json:"userFirstName"`
	LastName   string            `json:"userLastName"`
	Email      string            `json:"userEmail"`
	Price      decimal.Decimal   `json:"price,omitempty"`
	NoteType   notification.Note `json:"noteType,omitempty"`
	Seen       bool              `json:"seen,omitempty"`
}

func (h Handle) GetNotifications(w http.ResponseWriter, r *http.Request) {
	receiverId, err := user.GetAuthorizedUserId(h.Store, r)
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session for login status check.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	var result []NotificationAPI
	if err := h.Db.Model(&database.Notification{}).Select(
		"notifications.id, "+
			"notifications.receiver_id, "+
			"notifications.sender_id, "+
			"notifications.item_id, "+
			"items.name, "+
			"users.first_name, "+
			"users.last_name, "+
			"users.email, "+
			"notifications.price, "+
			"notifications.note_type, "+
			"notifications.seen").Joins(
		"left join items on items.id = notifications.item_id "+
			"left join users on users.id = notifications.sender_id").Where(
		"notifications.receiver_id = ?", receiverId).Order("id desc").Scan(&result).Error; err != nil {
	}
	SafeEncode(w, result)
}
