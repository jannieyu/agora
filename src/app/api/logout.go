package api

import (
	"github.com/gorilla/sessions"
	log "github.com/sirupsen/logrus"
	"net/http"
)

func (h Handle) Logout(w http.ResponseWriter, r *http.Request) {
	session, err := h.Store.Get(r, "user-auth")
	if err != nil {
		log.WithError(err).Error("Failed to get cookie session at logout.")
	}
	session.Options = &sessions.Options{SameSite: http.SameSiteStrictMode}

	// Revoke users authentication
	session.Values["authenticated"] = false
	session.Values["id"] = 0
	if err := session.Save(r, w); err != nil {
		log.WithError(err).Error("Failed to save cookie session.")
	}

	log.Info("Successful logout of user.")
	w.WriteHeader(http.StatusOK)
	SafeEncode(w, "{}")
}
