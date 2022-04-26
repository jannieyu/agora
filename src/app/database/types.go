package database

import (
	"agora/src/app/notification"
	"github.com/shopspring/decimal"
	"time"
)

type Bid struct {
	ID        uint32          `json:"id,omitempty" gorm:"primarykey"`
	BidderID  uint32          `json:"bidderId,omitempty"`
	ItemID    uint32          `json:"itemId,omitempty"`
	BidPrice  decimal.Decimal `json:"bidPrice,omitempty" gorm:"type:decimal(6,2);"`
	CreatedAt time.Time       `json:"createdAt,omitempty" gorm:"autoCreateTime"`
}

type BidBot struct {
	ID      uint32          `json:"id,omitempty" gorm:"primarykey"`
	OwnerID uint32          `json:"ownerId,omitempty"`
	ItemID  uint32          `json:"itemId,omitempty"`
	MaxBid  decimal.Decimal `json:"maxBid,omitempty" gorm:"type:decimal(6,2);"`
	Active  bool            `json:"active,omitempty"`
}
type Notification struct {
	ID         uint32            `json:"id,omitempty" gorm:"primarykey"`
	ReceiverID uint32            `json:"receiverId,omitempty"`
	SenderID   uint32            `json:"senderId,omitempty"`
	ItemID     uint32            `json:"itemId,omitempty"`
	Price      decimal.Decimal   `json:"price,omitempty" gorm:"type:decimal(6,2);"`
	NoteType   notification.Note `json:"noteType,omitempty"`
}

type User struct {
	ID                   uint32         `json:"id,omitempty" gorm:"primarykey"`
	FirstName            string         `json:"firstName,omitempty"`
	LastName             string         `json:"lastName,omitempty"`
	Email                string         `json:"email,omitempty"`
	Pword                string         `json:"pword,omitempty"`
	Image                string         `json:"image,omitempty"`
	Bio                  string         `json:"bio,omitempty"`
	Bids                 []Bid          `json:"bids,omitempty" gorm:"foreignkey:BidderID"`
	BidBots              []BidBot       `json:"bidBots,omitempty" gorm:"foreignkey:OwnerID"`
	ReceiveNotifications []Notification `json:"receiveNotifications,omitempty" gorm:"foreignkey:ReceiverID"`
	SendNotifications    []Notification `json:"sendNotifications,omitempty" gorm:"foreignkey:SenderID"`
}

type Item struct {
	ID            uint32          `json:"id,omitempty" gorm:"primarykey"`
	SellerID      uint32          `json:"sellerId,omitempty"`
	Seller        User            `json:"seller,omitempty" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignkey:SellerID"`
	Name          string          `json:"name,omitempty"`
	Image         string          `json:"image,omitempty"`
	Category      string          `json:"category,omitempty"`
	StartingPrice decimal.Decimal `json:"price,omitempty" gorm:"type:decimal(6,2);"`
	Condition     string          `json:"condition,omitempty"`
	Description   string          `json:"description,omitempty"`
	Bids          []Bid           `json:"bids" gorm:"foreignkey:ItemID"`
	BidBots       []BidBot        `json:"bidBots" gorm:"foreignkey:ItemID"`
	Notifications []Notification  `json:"notifications" gorm:"foreignkey:ItemID"`
	HighestBid    decimal.Decimal `json:"highestBid"  gorm:"type:decimal(6,2);"`
	NumBids       uint32          `json:"numBids"`
	BuyItNowPrice decimal.Decimal `json:"buyItNowPrice" gorm:"type:decimal(6,2);"`
	CreatedAt     time.Time       `json:"createdAt,omitempty" gorm:"autoCreateTime"`
}
