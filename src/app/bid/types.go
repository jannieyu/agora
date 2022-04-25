package bid

type BidAPI struct {
	ItemID   uint32 `json:"itemId"`
	BidPrice string `json:"bidPrice"`
}
