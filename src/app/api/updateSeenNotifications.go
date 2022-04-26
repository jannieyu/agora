package api

import (
	"encoding/json"
	"fmt"
	log "github.com/sirupsen/logrus"
	"net/http"
)

type seenNotePayload struct {
	NoteIds []uint32
}

func (h Handle) UpdateSeenNotifications(w http.ResponseWriter, r *http.Request) {
	session, err := h.Store.Get(r, "user-auth")
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session for login status check.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	receiverId := session.Values["id"].(uint32)

	urlParams := r.URL.Query()["data"][0]
	var payload seenNotePayload
	if err := json.Unmarshal([]byte(urlParams), &payload); err != nil {
		log.WithError(err).Error("Failed to unmarshal bid information.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	var noteReceiverIds []uint32
	if err := h.Db.Table("notifications").Select("receiver_id").Where("id IN ?", payload.NoteIds).Find(&noteReceiverIds).Error; err != nil {
		log.WithError(err).Error("Failed to query notifications to be marked as seen.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	for _, r := range noteReceiverIds {
		if r != receiverId {
			log.Error(fmt.Sprintf("Logged-in user %d does not match notification recipient %d.", receiverId, r))
			w.WriteHeader(http.StatusBadRequest)
			return
		}
	}
	if err = h.Db.Table("notifications").Where("id IN ?", payload.NoteIds).Updates(map[string]interface{}{"seen": true}).Error; err != nil {
		log.WithError(err).Error("Failed to update notifications as seen.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	SafeEncode(w, "{}")
}
