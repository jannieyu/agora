package api

import (
	"agora/src/app/database"
	u "agora/src/app/user"
	"fmt"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"net/http"
)

func (h Handle) GetUserHistory(w http.ResponseWriter, r *http.Request) {
	userID, err := u.GetAuthorizedUserId(h.Store, r)
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session for recording item click.")
	}
	if userID == 0 {
		log.Error(fmt.Sprintf("Cannot view user %d's history without authentication.", userID))
		w.WriteHeader(http.StatusForbidden)
		return
	}
	var user database.User
	if err := h.Db.Preload("Clicks", func(tx *gorm.DB) *gorm.DB {
		return tx.Order("item_clicks.created_at DESC")
	}).Find(&user).Error; err != nil {
		log.WithError(err).Error("Failed to query for user item clicks.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	var itemViewHistory []database.Item
	seenItemId := make(map[uint32]struct{})
	for _, click := range user.Clicks {
		if _, ok := seenItemId[click.ItemID]; !ok {
			seenItemId[click.ItemID] = struct{}{}
			item := database.Item{}
			if err := h.Db.Where("id = ?", click.ItemID).Find(&item).Error; err != nil {
				log.WithError(err).Error("Failed to collect user item history.")
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			itemViewHistory = append(itemViewHistory, item)
		}
	}
	SafeEncode(w, itemViewHistory)

}
