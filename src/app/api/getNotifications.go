package api

import (
	"agora/src/app/database"
	"agora/src/app/notification"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"net/http"
)

func (h Handle) GetNotifications(w http.ResponseWriter, r *http.Request) {
	{
		session, err := h.Store.Get(r, "user-auth")
		if err != nil {
			log.WithError(err).Error("Failed to get cookie session for login status check.")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		receiver_id := session.Values["id"].(uint32)
		var notifications []database.Notification
		if err := h.Db.Where(&database.Notification{ReceiverID: receiver_id}).Find(&notifications).Error; err != nil {
			log.WithError(err).Error("Failed to make query to get notifications.")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		SafeEncode(w, notifications)
		w.WriteHeader(http.StatusOK)
	}
}

func createNotification(db *gorm.DB, receiverId uint32, highestBid *database.Bid, noteType notification.Note) error {
	notification := database.Notification{
		ReceiverID: receiverId,
		SenderID:   highestBid.BidderID,
		ItemID:     highestBid.ItemID,
		Price:      highestBid.BidPrice,
		NoteType:   noteType,
	}
	if err := db.Create(&notification).Error; err != nil {
		return err
	}
	return nil
}
