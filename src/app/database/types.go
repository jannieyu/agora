package database

import (
	"time"

	"github.com/shopspring/decimal"
)

type User struct {
	ID        uint32 `json:"id,omitempty" gorm:"primarykey"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Email     string `json:"email"`
	Pword     string `json:"pword,omitempty"`
	Image     string `json:"image,omitempty"`
	Bio       string `json:"bio,omitempty"`
}

type Item struct {
	ID          uint32          `json:"id,omitempty" gorm:"primarykey"`
	SellerID    uint32          `json:"sellerId"`
	Seller      User            `json:"seller" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignkey:SellerID"`
	Name        string          `json:"name,omitempty"`
	Image       string          `json:"image,omitempty"`
	Category    string          `json:"category,omitempty"`
	Price       decimal.Decimal `json:"price,omitempty" gorm:"type:decimal(6,2);"`
	Condition   string          `json:"condition,omitempty"`
	Description string          `json:"description,omitempty"`
	CreatedAt   time.Time       `json:"createdAt" gorm:"autoCreateTime"`
}

type Bid struct {
	ID        uint32          `json:"id,omitempty" gorm:"primarykey"`
	BidderID  uint32          `json:"bidderId"`
	Bidder    User            `json:"bidder" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignkey:BidderID"`
	ItemID    uint32          `json:"itemID"`
	Item      Item            `json:"item" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignkey:ItemID"`
	BidPrice  decimal.Decimal `json:"bidPrice" gorm:"type:decimal(6,2);"`
	CreatedAt time.Time       `json:"createdAt" gorm:"autoCreateTime"`
}
