package bidBot

type BidBotAPI struct {
	ItemID    uint32 `json:"itemId,omitempty"`
	Increment string `json:"inc,omitempty" gorm:"type:decimal(6,2);"`
	MaxBid    string `json:"maxBid,omitempty" gorm:"type:decimal(6,2);"`
}
