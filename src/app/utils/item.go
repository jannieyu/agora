package utils

import (
	"agora/src/app/database"
	"errors"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/blevesearch/bleve/v2"
	"github.com/shopspring/decimal"
	log "github.com/sirupsen/logrus"
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
	diskLocation := "../../static/" + filename

	if err := ioutil.WriteFile(diskLocation, data, 0777); err != nil {
		log.WithError(err).Error("Failed to write to disk.")
		return "", err
	}
	return filename, nil
}

func PopulateItem(item *database.Item, r *http.Request, index bleve.Index, sellerID uint32) error {
	item.Name = r.FormValue("name")
	item.Category = r.FormValue("category")
	item.Condition = r.FormValue("condition")
	item.Description = r.FormValue("description")
	item.SellerID = sellerID

	itemPrice, err := ConvertStringPriceToDecimal(r.FormValue("price"))
	if err != nil {
		log.WithError(err).Error("Failed to parse item price value.")
		return err
	}
	item.StartingPrice = itemPrice

	image_location, err := processImage(r)
	if err != nil {
		log.WithError(err).Error("Failed to process item image.")
		return err
	}
	item.Image = image_location

	return nil
}

func ConvertStringPriceToDecimal(price string) (decimal.Decimal, error) {
	if strings.EqualFold(price, "") {
		return decimal.Decimal{}, errors.New("Received empty price string.")
	}
	itemPrice, err := decimal.NewFromString(price)
	if err != nil {
		return decimal.Decimal{}, err
	}
	return itemPrice, nil
}
