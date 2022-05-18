package api

import (
	"agora/src/app/database"
	"agora/src/app/user"
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"net/http"
)

func (h Handle) RecordItemClick(w http.ResponseWriter, r *http.Request) {
	urlParams := r.URL.Query()["data"][0]
	payload := struct {
		ItemId uint32
	}{}
	if err := json.Unmarshal([]byte(urlParams), &payload); err != nil {
		log.WithError(err).Error("Failed to unmarshal item id while recording click.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	viewerID, err := user.GetAuthorizedUserId(h.Store, r)
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session for recording item click.")
	}
	if err := h.Db.Create(&database.ItemClick{
		ItemID:   payload.ItemId,
		ViewerID: viewerID,
	}).Error; err != nil {
		log.WithError(err).Error("Failed to query info info.")
	}

	if err = h.Db.Table("items").Where(
		"id = ?", payload.ItemId).Update(
		"num_views", gorm.Expr("num_views + 1")).Error; err != nil {
		log.WithError(err).Error("Failed to update num views for item.")
	}
}
