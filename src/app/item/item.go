package item

import (
	"agora/src/app/bid"
	"agora/src/app/database"
	"agora/src/app/notification"
	"agora/src/app/ws"
	"errors"
	"fmt"
	"gorm.io/gorm"
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
		newStartingPrice, err := ConvertStringPriceToDecimal(r.FormValue("price"))
		if err != nil {
			log.WithError(err).Error("Failed to parse starting price value.")
			return err
		}

		item.StartingPrice = newStartingPrice
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
		log.Info("Converted empty string to 0 value.")
		return decimal.NewFromInt(0), nil
	}
	itemPrice, err := decimal.NewFromString(price)
	if err != nil {
		return decimal.Decimal{}, err
	}
	return itemPrice, nil
}

func CloseAuction(db *gorm.DB, hub *ws.Hub) error {
	var items []database.Item
	if err := db.Where("active = ?", true).Find(&items).Error; err != nil {
		return err
	}
	for _, item := range items {
		if err := notifySellerOfItemResult(db, hub, item); err != nil {
			return err
		}
		if err := notifyBiddersOfItemResult(db, hub, item); err != nil {
			return err
		}
		item.Active = false
		if err := db.Save(&item).Error; err != nil {
			return err
		}
	}
	return nil
}

func notifySellerOfItemResult(db *gorm.DB, hub *ws.Hub, item database.Item) error {
	if item.NumBids == 0 {
		if err := bid.CreateNotification(db, hub, database.Notification{
			ReceiverID: item.SellerID,
			SenderID:   0,
			ItemID:     item.ID,
			Price:      decimal.Decimal{},
			NoteType:   notification.ITEM_NOT_SOLD,
			Seen:       false,
		}); err != nil {
			return err
		}
	} else {
		var winningBid database.Bid
		if err := db.Where("bid_price = ? AND item_id = ?", item.HighestBid, item.ID).Find(&winningBid).Error; err != nil {
			return err
		}
		if winningBid.BidderID == 0 {
			return errors.New(fmt.Sprintf("No winner found for item %d", item.ID))
		}
		if err := bid.CreateNotification(db, hub, database.Notification{
			ReceiverID: item.SellerID,
			SenderID:   winningBid.ID,
			ItemID:     item.ID,
			Price:      item.HighestBid,
			NoteType:   notification.ITEM_SOLD,
			Seen:       false,
		}); err != nil {
			return err
		}
	}
	return nil
}

func notifyBiddersOfItemResult(db *gorm.DB, hub *ws.Hub, item database.Item) error {
	var manualBids []database.Bid
	if err := db.Where("item_id = ?", item.ID).Find(&manualBids).Error; err != nil {
		return err
	}
	s := make(map[uint32]struct{})
	var exists = struct{}{}
	for _, b := range manualBids {
		if _, ok := s[b.BidderID]; !ok {
			if b.BidPrice == item.HighestBid {
				if err := bid.CreateNotification(db, hub, database.Notification{
					ReceiverID: b.BidderID,
					SenderID:   item.SellerID,
					ItemID:     item.ID,
					Price:      item.HighestBid,
					NoteType:   notification.WON,
					Seen:       false,
				}); err != nil {
					return err
				}
			} else {
				if err := bid.CreateNotification(db, hub, database.Notification{
					ReceiverID: b.BidderID,
					SenderID:   item.SellerID,
					ItemID:     item.ID,
					Price:      item.HighestBid,
					NoteType:   notification.LOST,
					Seen:       false,
				}); err != nil {
					return err
				}
			}
			s[b.BidderID] = exists
		}
	}
	var bidBots []database.BidBot
	if err := db.Where("item_id = ? AND active = ?", item.ID, true).Find(&bidBots).Error; err != nil {
		return err
	}
	for _, b := range bidBots {
		if err := bid.CreateNotification(db, hub, database.Notification{
			ReceiverID: b.OwnerID,
			SenderID:   item.SellerID,
			ItemID:     b.ItemID,
			Price:      decimal.Decimal{},
			NoteType:   notification.BIDBOT_DEACTIVATED + "_AUCTION_END"}); err != nil {
			return err
		}
	}
	return nil
}
