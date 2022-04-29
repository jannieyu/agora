package user

import (
	"agora/src/app/database"
	"agora/src/app/item"
	"errors"
	"github.com/gorilla/sessions"
	"net/http"
	"strings"

	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	log.Debug("Failure on checking password hash.", err)
	return err == nil
}

func PreloadSafeSellerInfo(db *gorm.DB) *gorm.DB {
	return db.Preload("Seller", func(tx *gorm.DB) *gorm.DB {
		return tx.Select("id", "first_name", "last_name", "email")
	})
}

func PopulateUser(user *database.User, r *http.Request) error {
	if !strings.EqualFold(r.FormValue("firstName"), "") {
		user.FirstName = r.FormValue("firstName")
	}
	if !strings.EqualFold(r.FormValue("lastName"), "") {
		user.LastName = r.FormValue("lastName")
	}
	if !strings.EqualFold(r.FormValue("email"), "") {
		user.Email = r.FormValue("email")
	}
	if !strings.EqualFold(r.FormValue("newPword"), "") {
		if !CheckPasswordHash(r.FormValue("oldPword"), user.Pword) {
			return errors.New("Failed password change; empty or incorrect old password.")
		}
		if CheckPasswordHash(r.FormValue("newPword"), user.Pword) {
			return errors.New("Failed password change; new and old password are the same.")
		}
		newHash, err := HashPassword(r.FormValue("newPword"))
		if err != nil {
			log.WithError(err).Error("Failed to hash passcode.")
			return err
		}
		user.Pword = newHash
	}
	if !strings.EqualFold(r.FormValue("bio"), "") {
		user.Bio = r.FormValue("bio")
	}

	if image_location, err := item.ProcessImage(r, item.USERS_FOLDER); err != nil {
		log.Info("No user profile image was given.")
		return err
	} else {
		user.Image = image_location
	}
	return nil
}

func GetAuthorizedUserId(store *sessions.CookieStore, r *http.Request) (uint32, error) {
	userId := uint32(0)
	session, err := store.Get(r, "user-auth")
	if err != nil {
		return userId, err
	}

	switch val := session.Values["id"].(type) {
	case uint32:
		userId = val
	case int:
		userId = uint32(val)
	}

	return userId, nil
}
