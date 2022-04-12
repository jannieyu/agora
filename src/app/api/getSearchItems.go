package api

import (
	"agora/src/app/database"
	"agora/src/app/utils"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/blevesearch/bleve/v2"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func (h Handle) GetSearchItems(w http.ResponseWriter, r *http.Request) {
	urlParams := r.URL.Query()["data"][0]
	var filters utils.Filters
	if err := json.Unmarshal([]byte(urlParams), &filters); err != nil {
		log.WithError(err).Error("Failed to unmarshal search filters.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	result := h.Db
	result = result.Preload("Seller", func(tx *gorm.DB) *gorm.DB {
		return tx.Select("id", "first_name", "last_name", "email")
	})

	switch filters.SortBy {
	case utils.MostRecent:
		result = result.Order("created_at desc")
	case utils.PriceHighToLow:
		result = result.Order("price desc")
	case utils.PriceLowToHigh:
		result = result.Order("price")
	default:
		log.Info(filters.SortBy)
	}

	if !strings.EqualFold(filters.Condition, "any") {
		result = result.Where("condition = ?", filters.Condition)
	}
	if !strings.EqualFold(filters.Category, "all") {
		result = result.Where("category = ?", filters.Category)
	}

	var items = []database.Item{}
	var idx []uint32
	if strings.EqualFold(filters.Keywords, "") {
		result.Find(&items)
	} else {
		query := bleve.NewMatchQuery(filters.Keywords)
		search := bleve.NewSearchRequest(query)
		searchResults, err := h.Index.Search(search)
		if err != nil {
			log.WithError(err).Error("Failed with search.")
		}
		for i := 0; i < searchResults.Hits.Len(); i++ {
			val, _ := strconv.Atoi(searchResults.Hits[i].ID)
			idx = append(idx, uint32(val))
		}
		log.Info(idx)
		if len(idx) > 0 {
			result.Find(&items, idx)
		}
	}

	if result.Error != nil {
		log.WithError(result.Error).Error("Failed to make query to get all items.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	SafeEncode(w, items)
	w.WriteHeader(http.StatusOK)
}
