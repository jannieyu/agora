package database

import (
	"time"

	"github.com/shopspring/decimal"
)

type User struct {
	ID        uint32 `json:"id,omitempty" gorm:"primarykey"`
	FirstName string `json:"firstName,omitempty"`
	LastName  string `json:"lastName,omitempty"`
	Email     string `json:"email,omitempty"`
	Pword     string `json:"pword,omitempty"`
	Image     string `json:"image,omitempty"`
	Bio       string `json:"bio,omitempty"`
}

type Item struct {
	ID          uint32          `json:"id,omitempty" gorm:"primarykey"`
	SellerID    uint32          `json:"sellerId,omitempty"`
	Seller      User            `json:"seller,omitempty" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignkey:SellerID"`
	Name        string          `json:"name,omitempty"`
	Image       string          `json:"image,omitempty"`
	Category    string          `json:"category,omitempty"`
	Price       decimal.Decimal `json:"price,omitempty" gorm:"type:decimal(6,2);"`
	Condition   string          `json:"condition,omitempty"`
	Description string          `json:"description,omitempty"`
	Bids        []Bid           `json:"bids"`
	CreatedAt   time.Time       `json:"createdAt,omitempty" gorm:"autoCreateTime"`
}

type Bid struct {
	ID        uint32          `json:"id,omitempty" gorm:"primarykey"`
	BidderID  uint32          `json:"bidderId,omitempty"`
	Bidder    User            `json:"bidder,omitempty" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignkey:BidderID"`
	ItemID    uint32          `json:"itemId,omitempty"`
	BidPrice  decimal.Decimal `json:"bidPrice,omitempty" gorm:"type:decimal(6,2);"`
	CreatedAt time.Time       `json:"createdAt,omitempty" gorm:"autoCreateTime"`
}
