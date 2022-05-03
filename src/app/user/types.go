package user

import "agora/src/app/database"

type LoginCredentialsAPI struct {
	Email     string
	Password  string
	IsSignUp  bool
	FirstName string
	LastName  string
}

type LoginStatusAPI struct {
	database.User
	Count int64 `json:"newNotificationCount"`
}
