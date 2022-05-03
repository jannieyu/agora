package api

import (
	"agora/src/app/database"
	"encoding/json"
	"net/http"

	log "github.com/sirupsen/logrus"
)

func (h Handle) GetUser(w http.ResponseWriter, r *http.Request) {
	urlParams := r.URL.Query()["data"][0]
	payload := struct {
		UserId uint32
	}{}
	if err := json.Unmarshal([]byte(urlParams), &payload); err != nil {
		log.WithError(err).Error("Failed to unmarshal user id while getting user.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if payload.UserId == 0 {
		log.Error("Cannot get user info without specified user id.")
		w.WriteHeader(http.StatusForbidden)
		return
	}
	var result []database.User
	if err := h.Db.Model(&database.User{}).Select("first_name", "last_name", "email", "image", "bio").Where(
		"id = ?", payload.UserId).Find(&result).Error; err != nil {
		log.WithError(err).Error("Failed to query user info.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	SafeEncode(w, result)
}
