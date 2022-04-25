package item

import (
	"agora/src/app/database"
	"errors"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/shopspring/decimal"
	log "github.com/sirupsen/logrus"
)

func ProcessImage(r *http.Request) (string, error) {
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

func PopulateItem(item *database.Item, r *http.Request, sellerID uint32, isNew bool) error {
	item.Name = r.FormValue("name")
	item.Category = r.FormValue("category")
	item.Condition = r.FormValue("condition")
	item.Description = r.FormValue("description")
	item.SellerID = sellerID

	startingPrice, err := ConvertStringPriceToDecimal(r.FormValue("price"))
	if err != nil {
		log.WithError(err).Error("Failed to parse starting price value.")
		return err
	}

	//r.FormValue("buyItNowPrice")
	buyItNowPrice, err := ConvertStringPriceToDecimal("9023")
	if err != nil {
		log.WithError(err).Error("Failed to parse Buy It Now price value.")
		return err
	}

	if isNew {
		item.StartingPrice = startingPrice
		if buyItNowPrice.InexactFloat64() <= startingPrice.InexactFloat64() {
			log.WithError(err).Error("Buy It Now price cannot be less than starting price.")
			return errors.New("Buy It Now price cannot be less than starting price.")
		}

	} else {
		if buyItNowPrice.InexactFloat64() <= item.HighestBid.InexactFloat64() {
			log.WithError(err).Error("Buy It Now price cannot be less than existing highest bid.")
			return errors.New("Buy It Now price cannot be less than existing highest bid.")
		}
	}
	item.BuyItNowPrice = buyItNowPrice

	image_location, err := ProcessImage(r)
	if err != nil {
		log.WithError(err).Error("Failed to process item image.")
		return err
	}
	item.Image = image_location

	return nil
}

func ConvertStringPriceToDecimal(price string) (decimal.Decimal, error) {
	if strings.EqualFold(price, "") {
		log.Info("Coverted empty string to 0 value.")
		return decimal.NewFromInt(0), nil
	}
	itemPrice, err := decimal.NewFromString(price)
	if err != nil {
		return decimal.Decimal{}, err
	}
	return itemPrice, nil
}
