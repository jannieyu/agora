package handler

import (
	"encoding/json"
	"github.com/gorilla/sessions"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"net/http"
)

func New(db *gorm.DB, store *sessions.CookieStore) handler {
	return handler{db, store}
}

func SafeEncode(w http.ResponseWriter, v interface{}) {
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.WithError(err).Error("Failed to encode to json and write response.")
		w.WriteHeader(http.StatusInternalServerError)
	}
}
