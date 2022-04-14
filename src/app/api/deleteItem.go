package api

import (
	"agora/src/app/database"
	"encoding/json"
	"net/http"
	"strconv"

	log "github.com/sirupsen/logrus"
)

func (h Handle) DeleteItem(w http.ResponseWriter, r *http.Request) {
	urlParams := r.URL.Query()["data"][0]
	payload := struct {
		itemId uint32
	}{}
	if err := json.Unmarshal([]byte(urlParams), &payload); err != nil {
		log.WithError(err).Error("Failed to unmarshal item id for item deletion.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	var item database.Item
	if err := h.Db.First(&item, payload.itemId).Error; err != nil {
		log.WithError(err).Error("Failed to find existing item entry in Items table.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if err := h.Db.Delete(&item).Error; err != nil {
		log.WithError(err).Error("Failed to delete item entry in Items table.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if err := h.Index.Delete(strconv.FormatUint(uint64(item.ID), 10)); err != nil {
		log.WithError(err).Error("Failed to delete item index.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	SafeEncode(w, "{}")
	w.WriteHeader(http.StatusOK)
	log.Info("Completed item deletion.")
}
