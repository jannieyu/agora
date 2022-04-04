package database

type User struct {
	ID        uint32 `json:"id,omitempty"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Email     string `json:"email"`
	Pword     string `json:"pword,omitempty"`
}
