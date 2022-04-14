package api

import (
	"agora/src/app/database"
	"agora/src/app/utils"
	"net/http"
	"strconv"

	log "github.com/sirupsen/logrus"
)

func (h Handle) AddItem(w http.ResponseWriter, r *http.Request) {
	session, err := h.Store.Get(r, "user-auth")
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session at logout.")
	}
	var item database.Item
	sellerID := session.Values["id"].(uint32)
	if err := utils.PopulateItem(&item, r, h.Index, sellerID); err != nil {
		log.WithError(err).Error("Failed to parse item data.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if err := h.Db.Create(&item).Error; err != nil {
		log.WithError(err).Error("Failed to add new item to database.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if err := h.Index.Index(strconv.FormatUint(uint64(item.ID), 10), item); err != nil {
		log.WithError(err).Error("Failed to index item.")
	}
	w.WriteHeader(http.StatusCreated)
	SafeEncode(w, "{}")
	log.Info("Completed item upload.")
}
