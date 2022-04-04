package handler

import (
	"github.com/gorilla/sessions"
	"gorm.io/gorm"
)

type loginCredentials struct {
	Email     string
	Password  string
	IsSignUp  bool
	FirstName string
	LastName  string
}
type handler struct {
	DB    *gorm.DB
	store *sessions.CookieStore
}
