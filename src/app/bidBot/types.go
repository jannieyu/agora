package bidBot

type BidBotAPI struct {
	ItemID uint32 `json:"itemId,omitempty"`
	MaxBid string `json:"maxBid,omitempty" gorm:"type:decimal(6,2);"`
}
