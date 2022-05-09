package search

type SortMethod string

const (
	PriceHighLow SortMethod = "highLow"
	PriceLowHigh SortMethod = "lowHigh"
	MostViewed   SortMethod = "mostViewed"
)

type Filters struct {
	SortBy          SortMethod `json:"sort,omitempty"`
	Condition       string     `json:"condition,omitempty"`
	Category        string     `json:"category,omitempty"`
	Search          string     `json:"search,omitempty"`
	SellerItemsOnly bool       `json:"sellerItemsOnly,omitempty"`
}
