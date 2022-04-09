package utils

import (
	"agora/src/app/database"
	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
	"net/http"
)

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func PopulateUser(user *database.User, r *http.Request) error {
	user.FirstName = r.FormValue("first_name")
	user.LastName = r.FormValue("last_name")
	user.Email = r.FormValue("email")
	hash, err := HashPassword(r.FormValue("pword"))
	if err != nil {
		log.WithError(err).Error("Failed to hash passcode.")
		return err
	} else {
		user.Pword = hash
	}

	user.Bio = r.FormValue("bio")

	if image_location, err := processImage(r); err != nil {
		log.WithError(err).Error("Failed to process user image.")
		return err
	} else {
		user.Image = image_location
	}
	return nil
}
