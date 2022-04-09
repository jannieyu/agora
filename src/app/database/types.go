package database

import (
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
	SellerID    uint32          `json:"seller_id"`
	Seller      User            `json:"seller" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignkey:SellerID"`
	Name        string          `json:"name,omitempty"`
	Image       string          `json:"image,omitempty"`
	Category    string          `json:"category,omitempty"`
	Price       decimal.Decimal `json:"price,omitempty"`
	Condition   string          `json:"condition,omitempty"`
	Description string          `json:"description,omitempty"`
}
