package api

import (
	"agora/src/app/database"
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"net/http"
)

func (h handle) GetSearchItems(w http.ResponseWriter, r *http.Request) {

	var items = []database.Item{}
	result := h.db.Find(&items)
	if result.Error != nil {
		log.WithError(result.Error).Error("Failed to make query to get all items.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(items)
}
