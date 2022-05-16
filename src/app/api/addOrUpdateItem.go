package api

import (
	"agora/src/app/database"
	i "agora/src/app/item"
	"agora/src/app/user"
	"agora/src/app/ws"
	"net/http"
	"strconv"
	"strings"

	log "github.com/sirupsen/logrus"
)

func (h Handle) AddOrUpdateItem(w http.ResponseWriter, r *http.Request) {
	isAuctionActive, err := IsAuctionActive(h.Db)
	if err != nil {
		log.WithError(err).Error("Failed to check if auction is active.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if !isAuctionActive {
		log.Error("Auction is inactive; cannot create/update item.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	auction, err := GetMostRecentAuction(h.Db)
	if err != nil {
		log.WithError(err).Error("Failed to get auction info when creating/updating item.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	sellerID, err := user.GetAuthorizedUserId(h.Store, r)
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session for login status check.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

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
		item.AuctionID = auction.ID
	} else if item.AuctionID != auction.ID {
		log.Error("Cannot update item; item's auction id does not match current auction id.")
	} else if item.SellerID != sellerID {
		log.Error("Cannot update item; user doesn't match seller.")
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
		if err := h.Hub.BroadcastMessage([]uint32{}, ws.BroadcastAPI{
			BroadcastType: ws.UPDATE_ITEM,
			Data:          item,
		}); err != nil {
			log.WithError(err).Error("Failed to broadcast item update.")
		}
		w.WriteHeader(http.StatusOK)
	} else {
		w.WriteHeader(http.StatusCreated)
	}
	SafeEncode(w, "{}")
	log.Info("Completed item upload.")
}
