package api

import (
	"agora/src/app/database"
	"encoding/json"
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
	"net/http"
	"strconv"
)

func (h handle) DeleteItem(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])
	var item database.Item
	if err := h.db.First(&item, id).Error; err != nil {
		log.WithError(err).Error("Failed to find existing item entry in Items table.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if err := h.db.Delete(&item).Error; err != nil {
		log.WithError(err).Error("Failed to delete item entry in Items table.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode("{}")
	log.Info("Completed item deletion.")
}
