package api

import (
	"encoding/json"
	"github.com/gorilla/sessions"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"net/http"
)

type handle struct {
	db    *gorm.DB
	store *sessions.CookieStore
}

func New(db *gorm.DB, store *sessions.CookieStore) handle {
	return handle{db, store}
}

func safeEncode(w http.ResponseWriter, v interface{}) {
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.WithError(err).Error("Failed to encode to json and write response.")
		w.WriteHeader(http.StatusInternalServerError)
	}
}
