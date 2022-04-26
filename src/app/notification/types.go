package notification

type Note string

const (
	OUTBID             Note = "OUTBID"
	WON                Note = "WON"
	LOST               Note = "LOST"
	ITEM_BID_ON        Note = "ITEM_BID_ON"
	ITEM_SOLD          Note = "ITEM_SOLD"
	BIDBOT_DEACTIVATED Note = "BIDBOT_DEACTIVATED"
	BIDBOT_BID         Note = "BIDBOT_BID"
)