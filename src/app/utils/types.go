package utils

type SortMethod string

const (
	PriceHighLow SortMethod = "highLow"
	PriceLowHigh SortMethod = "lowHigh"
)

type Filters struct {
	SortBy    SortMethod `json:"sort,omitempty"`
	Condition string     `json:"condition,omitempty"`
	Category  string     `json:"category,omitempty"`
	Search    string     `json:"search,omitempty"`
}

type BidAPI struct {
	ItemID   uint32 `json:"itemId"`
	BidPrice string `json:"bidPrice"`
}

type BidBotAPI struct {
	ItemID    uint32 `json:"itemId,omitempty"`
	Increment string `json:"inc,omitempty" gorm:"type:decimal(6,2);"`
	MaxBid    string `json:"maxBid,omitempty" gorm:"type:decimal(6,2);"`
}

type LoginCredentialsAPI struct {
	Email     string
	Password  string
	IsSignUp  bool
	FirstName string
	LastName  string
}
