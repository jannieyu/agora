package api

import (
	"agora/src/app/database"
	"agora/src/app/user"
	"net/http"

	log "github.com/sirupsen/logrus"
)

func (h Handle) GetSellerItems(w http.ResponseWriter, r *http.Request) {
	session, err := h.Store.Get(r, "user-auth")
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session when retrieving seller items.")
	}

	seller_id := session.Values["id"].(uint32)
	items := []database.Item{}
	db := user.PreloadSafeSellerInfo(h.Db)
	if err := db.Where(&database.Item{SellerID: seller_id}).Find(&items).Error; err != nil {
		log.WithError(err).Error("Failed to make query to get seller items.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	SafeEncode(w, items)
	w.WriteHeader(http.StatusOK)
}
