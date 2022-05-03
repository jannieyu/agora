package api

import (
	"agora/src/app/database"
	i "agora/src/app/item"
	"agora/src/app/user"
	"net/http"
	"strconv"
	"strings"

	log "github.com/sirupsen/logrus"
)

func (h Handle) AddOrUpdateItem(w http.ResponseWriter, r *http.Request) {
	sellerID, err := user.GetAuthorizedUserId(h.Store, r)
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session for login status check.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	log.Info("addOrUpdateItem", sellerID)

	if sellerID == 0 {
		log.Error("Cannot add or update item to unauthenticated user.")
		w.WriteHeader(http.StatusForbidden)
		return
	}
	var itemId uint32
	if strings.EqualFold(r.FormValue("id"), "") {
		itemId = 0
	} else {
		idVal, err := strconv.Atoi(r.FormValue("id"))
		if err != nil {
			log.WithError(err).Error("Failed to retrieve item id.")
			w.WriteHeader(http.StatusInternalServerError)
		}
		itemId = uint32(idVal)
	}

	var item database.Item
	if err := h.Db.Where("id = ?", itemId).Limit(1).Find(&item).Error; err != nil {
		log.WithError(err).Error("Failed to retrieve existing item (if any) from database.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if item.ID == 0 {
		item.SellerID = sellerID
	} else if item.SellerID != sellerID {
		log.WithError(err).Error("Cannot update item; user doesn't match seller.")
		w.WriteHeader(http.StatusForbidden)
		return
	}

	if err := i.PopulateItem(&item, r); err != nil {
		log.WithError(err).Error("Failed to parse item data.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if err := h.Db.Save(&item).Error; err != nil {
		log.WithError(err).Error("Failed to add or update item to database.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if err := h.Index.Index(strconv.FormatUint(uint64(item.ID), 10), item); err != nil {
		log.WithError(err).Error("Failed to index item.")
	}
	if itemId > 0 {
		w.WriteHeader(http.StatusOK)
	} else {
		w.WriteHeader(http.StatusCreated)
	}
	SafeEncode(w, "{}")
	log.Info("Completed item upload.")
}
