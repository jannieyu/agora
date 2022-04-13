package utils

type SortMethod string

const (
	Recent       SortMethod = "recent"
	PriceHighLow SortMethod = "high_low"
	PriceLowHigh SortMethod = "low_high"
)

type Filters struct {
	SortBy    SortMethod `json:"sort,omitempty"`
	Condition string     `json:"condition,omitempty"`
	Category  string     `json:"category,omitempty"`
	Search    string     `json:"search,omitempty"`
}

type LoginCredentials struct {
	Email     string
	Password  string
	IsSignUp  bool
	FirstName string
	LastName  string
}
