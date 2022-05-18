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
	BotID     uint32          `json:"botId,omitempty"`
}

type BidBot struct {
	ID      uint32          `json:"id,omitempty" gorm:"primarykey"`
	OwnerID uint32          `json:"ownerId,omitempty"`
	ItemID  uint32          `json:"itemId,omitempty"`
	MaxBid  decimal.Decimal `json:"maxBid,omitempty" gorm:"type:decimal(6,2);"`
	Bids    []Bid           `json:"bids,omitempty" gorm:"foreignkey:BotID"`
	Active  bool            `json:"active"`
}

type Notification struct {
	ID         uint32            `json:"id,omitempty" gorm:"primarykey"`
	ReceiverID uint32            `json:"receiverId,omitempty"`
	SenderID   uint32            `json:"senderId,omitempty"`
	ItemID     uint32            `json:"itemId,omitempty"`
	Price      decimal.Decimal   `json:"price,omitempty" gorm:"type:decimal(6,2);"`
	NoteType   notification.Note `json:"noteType,omitempty"`
	Seen       bool              `json:"seen"`
}

type ItemClick struct {
	ID        uint32    `json:"id,omitempty"`
	ItemID    uint32    `json:"itemId,omitempty"`
	ViewerID  uint32    `json:"viewerId,omitempty"`
	CreatedAt time.Time `json:"createdAt,omitempty" gorm:"autoCreateTime"`
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
	Clicks               []ItemClick    `json:"clicks,omitempty" gorm:"foreignkey:ViewerID"`
}

type Item struct {
	ID            uint32          `json:"id,omitempty" gorm:"primarykey"`
	SellerID      uint32          `json:"sellerId,omitempty"`
	Seller        User            `json:"seller,omitempty" gorm:"constraint:OnUpdate:CASCADE;foreignkey:SellerID"`
	AuctionID     uint32          `json:"auctionId,omitempty"`
	Name          string          `json:"name,omitempty"`
	Image         string          `json:"image,omitempty"`
	Category      string          `json:"category,omitempty"`
	StartingPrice decimal.Decimal `json:"price,omitempty" gorm:"type:decimal(6,2);"`
	Condition     string          `json:"condition,omitempty"`
	Description   string          `json:"description,omitempty"`
	Bids          []Bid           `json:"bids" gorm:"foreignkey:ItemID"`
	BidBots       []BidBot        `json:"bidBots" gorm:"foreignkey:ItemID"`
	Notifications []Notification  `json:"notifications" gorm:"foreignkey:ItemID"`
	Clicks        []ItemClick     `json:"clicks" gorm:"foreignkey:ItemID"`
	HighestBid    decimal.Decimal `json:"highestBid"  gorm:"type:decimal(6,2);"`
	NumViews      uint32          `json:"numClicks"`
	NumBids       uint32          `json:"numBids"`
	Active        bool            `json:"active"`
	CreatedAt     time.Time       `json:"createdAt,omitempty" gorm:"autoCreateTime"`
}

type Auction struct {
	ID        uint32    `json:"id,omitempty" gorm:"primarykey"`
	Name      string    `json:"name,omitempty"`
	StartTime time.Time `json:"startTime,omitempty"`
	EndTime   time.Time `json:"endTime,omitempty"`
	Items     []Item    `json:"items,omitempty" gorm:"foreignkey:AuctionID"`
}
