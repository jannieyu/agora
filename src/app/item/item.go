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

type imageFolder string

const (
	ITEMS_FOLDER imageFolder = "items/"
	USERS_FOLDER imageFolder = "users/"
)

func ProcessImage(r *http.Request, folder imageFolder) (string, error) {
	file, header, err := r.FormFile("image")
	if err != nil {
		if err == http.ErrMissingFile {
			return "", nil
		}
		return "", err
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
	filename := "images/" + string(folder) + t + "-" + header.Filename
	diskLocation := "../../static/" + filename

	if err := ioutil.WriteFile(diskLocation, data, 0777); err != nil {
		log.WithError(err).Error("Failed to write to disk.")
		return "", err
	}
	return filename, nil
}

func PopulateItem(item *database.Item, r *http.Request) error {
	if !strings.EqualFold(r.FormValue("name"), "") {
		item.Name = r.FormValue("name")
	}
	if !strings.EqualFold(r.FormValue("category"), "") {
		item.Category = r.FormValue("category")
	}
	if !strings.EqualFold(r.FormValue("condition"), "") {
		item.Condition = r.FormValue("condition")
	}
	if !strings.EqualFold(r.FormValue("description"), "") {
		item.Description = r.FormValue("description")
	}

	if item.ID == 0 || (item.ID > 0 && item.NumBids == 0) {
		startingPrice, err := ConvertStringPriceToDecimal(r.FormValue("price"))
		if err != nil {
			log.WithError(err).Error("Failed to parse starting price value.")
			return err
		}
		item.StartingPrice = startingPrice
		item.HighestBid = item.StartingPrice
		item.Active = true
	} else if !strings.EqualFold(r.FormValue("price"), "") {
		return errors.New("Failed to enter starting price value; can only make changes if item is new or listed item has zero bids.")
	}

	imageLocation, err := ProcessImage(r, ITEMS_FOLDER)
	if err != nil {
		return err
	}

	if strings.EqualFold(imageLocation, "") {
		if item.ID == 0 {
			return errors.New("No image given while creating new item.")
		}
	} else {
		item.Image = imageLocation
	}

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
