package api

import (
	"encoding/json"
	"github.com/blevesearch/bleve/v2"
	"github.com/gorilla/sessions"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"net/http"
)

type Handle struct {
	Index bleve.Index
	Db    *gorm.DB
	Store *sessions.CookieStore
}

func New(index bleve.Index, db *gorm.DB, store *sessions.CookieStore) Handle {
	return Handle{index, db, store}
}

func SafeEncode(w http.ResponseWriter, v interface{}) {
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.WithError(err).Error("Failed to encode to json and write response.")
		w.WriteHeader(http.StatusInternalServerError)
	}
}
