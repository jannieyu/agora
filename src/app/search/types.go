package search

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
