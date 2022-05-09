package api

import (
	"agora/src/app/database"
	"agora/src/app/search"
	"agora/src/app/user"
	"encoding/json"
	"fmt"
	"github.com/blevesearch/bleve/v2"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm/clause"
	"net/http"
	"strconv"
	"strings"
	"time"
)

func (h Handle) GetSearchItems(w http.ResponseWriter, r *http.Request) {

	urlParams := r.URL.Query()["data"][0]
	var filters search.Filters
	if err := json.Unmarshal([]byte(urlParams), &filters); err != nil {
		log.WithError(err).Error("Failed to unmarshal search filters.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	result := h.Db.Preload("Bids")
	if filters.SellerItemsOnly {
		sellerId, err := user.GetAuthorizedUserId(h.Store, r)
		if err != nil {
			log.WithError(err).Error("Failed to get cookie session when authorized user id.")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		if sellerId > 0 {
			result = result.Where("seller_id = ?", sellerId).Order("active DESC")
		}

	} else {
		result = user.PreloadSafeSellerInfo(result)
		result = result.Where("active = ?", true)
	}

	switch filters.SortBy {
	case search.PriceHighLow:
		result = result.Order("highest_bid desc")
	case search.PriceLowHigh:
		result = result.Order("highest_bid")
	case search.MostViewed:
		var itemsByMostClicks []uint32
		now := time.Now()
		if err := h.Db.Model(&database.ItemClick{}).Select(
			"item_clicks.item_id").Group(
			"item_clicks.item_id").Where("item_clicks.created_at BETWEEN ? AND ?", now.Add(time.Duration(-24)*time.Hour), now).Order(
			"count(item_clicks.id) DESC").Find(&itemsByMostClicks).Error; err != nil {
			log.WithError(result.Error).Error("Failed to make query to sort items by most clicks.")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		if len(itemsByMostClicks) != 0 {
			query := ""
			for i, itemId := range itemsByMostClicks {
				query += fmt.Sprintf("WHEN id=%d THEN %d ", itemId, i)

			}
			result = result.Clauses(clause.OrderBy{
				Expression: clause.Expr{SQL: "CASE " + query + "END", WithoutParentheses: true},
			})
		}
	default:
		result = result.Order("created_at desc")
	}

	if !strings.EqualFold(filters.Condition, "any") && !strings.EqualFold(filters.Condition, "") {
		result = result.Where("condition = ?", filters.Condition)
	}
	if !strings.EqualFold(filters.Category, "all") && !strings.EqualFold(filters.Category, "") {
		result = result.Where(
			"category = ? or category like ?", filters.Category, filters.Category+"/%",
		)
	}

	var items = []database.Item{}
	var idx []uint32
	if strings.EqualFold(filters.Search, "") {
		result.Find(&items)
	} else {
		query := bleve.NewMatchQuery(filters.Search)
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
	//item.CloseAuction(h.Db, h.Hub)
	SafeEncode(w, items)
}
