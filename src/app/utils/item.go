package utils

import (
	"agora/src/app/database"
	"github.com/shopspring/decimal"
	log "github.com/sirupsen/logrus"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"
	"time"
)

func processImage(r *http.Request) (string, error) {
	log.Info("Enter here.")
	file, header, err := r.FormFile("image")
	if err != nil {
		log.WithError(err).Error("No photo given from request.")
		return "", nil
	}

	data, err := ioutil.ReadAll(file)
	if err != nil {
		log.WithError(err).Error("Failed to read image file.")
		return "", err
	}
	defer func(file multipart.File) {
		err := file.Close()
		if err != nil {
			log.WithError(err).Error("Failed to close photo file.")
		}
	}(file)

	t := strconv.FormatInt(time.Now().Unix(), 10)
	filename := "images/" + t + "-" + header.Filename

	if err := ioutil.WriteFile(filename, data, 0777); err != nil {
		log.WithError(err).Error("Failed to write to disk.")
		return "", err
	}
	return filename, nil
}

func PopulateItem(item *database.Item, r *http.Request, sellerID uint32) error {
	item.Name = r.FormValue("name")
	item.Category = r.FormValue("category")
	item.Condition = r.FormValue("condition")
	item.Description = r.FormValue("description")
	item.SellerID = sellerID

	if price := r.FormValue("price"); !strings.EqualFold(price, "") {
		item_price, err := decimal.NewFromString(price)
		if err != nil {
			log.WithError(err).Debug("Failed to parse string price.")
		}
		item.Price = item_price
	}

	if image_location, err := processImage(r); err != nil {
		log.WithError(err).Debug("Failed to process item image.")
	} else {
		item.Image = image_location
	}

	return nil
}
