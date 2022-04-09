package api

import (
	"agora/src/app/database"
	"agora/src/app/utils"
	"encoding/json"
	log "github.com/sirupsen/logrus"
	"net/http"
	"strings"
)

func (h handle) GetSearchItems(w http.ResponseWriter, r *http.Request) {
	urlParams := r.URL.Query()["data"][0]
	var filters utils.Filters
	if err := json.Unmarshal([]byte(urlParams), &filters); err != nil {
		log.WithError(err).Error("Failed to unmarshal search filters.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	result := h.db
	switch filters.SortBy {
	case utils.MostRecent:
		result = result.Order("name")
	case utils.PriceHighToLow:
		result = result.Order("price desc")
	case utils.PriceLowToHigh:
		result = result.Order("price")
	}
	if !strings.EqualFold(filters.Condition, "any") {
		result = result.Where("condition = ?", filters.Condition)
	}
	if !strings.EqualFold(filters.Category, "all") {
		result = result.Where("category = ?", filters.Category)
	}

	var items = []database.Item{}
	result.Find(&items)

	if result.Error != nil {
		log.WithError(result.Error).Error("Failed to make query to get all items.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(items)
}
