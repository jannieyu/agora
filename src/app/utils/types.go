package utils

type SortMethod string

const (
	MostRecent     SortMethod = "most_recent"
	PriceHighToLow SortMethod = "price_high_to_low"
	PriceLowToHigh SortMethod = "price_low_to_high"
)

type Filters struct {
	SortBy    SortMethod `json:"sort_by"`
	Condition string     `json:"condition"`
	Category  string     `json:"category"`
	Keywords  string     `json:"keywords"`
}

type LoginCredentials struct {
	Email     string
	Password  string
	IsSignUp  bool
	FirstName string
	LastName  string
}
