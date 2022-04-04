package database

import (
	log "github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Init() *gorm.DB {
	dsn := "host=localhost user=postgres password=postgres dbname=web port=5432 sslmode=disable TimeZone=US/Pacific"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.WithError(err).Error("Failed to connect to database.")
	}
	if err := db.AutoMigrate(&User{}); err != nil {
		log.WithError(err).Error("Failed to initiate Users table.")
	}
	return db
}
