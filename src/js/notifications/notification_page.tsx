import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "semantic-ui-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { useCallback, useDispatch, useEffect, useState, useSelector } from "../base/react_base"
import { AppState, Notification, NotificationType } from "../base/reducers"
import { clearNotifcation, setData } from "../base/actions"
import { safeParseFloat } from "../base/util"
import { apiCall as updateSeenNotifications } from "../api/update_seen_notifications"
import {
  apiCall as getNotifications,
  Response as GetNotificationsResponse,
} from "../api/get_notifications"

const iconMap = new Map<NotificationType, IconProp>([
  [NotificationType.WON, "face-smile"],
  [NotificationType.LOST, "face-frown"],
  [NotificationType.OUTBID, "face-frown"],
  [NotificationType.ITEM_BID_ON, "arrow-up"],
  [NotificationType.ITEM_SOLD, "sack-dollar"],
  [NotificationType.BIDBOT_BID, "arrow-up"],
  [NotificationType.BIDBOT_DEACTIVATED, "face-frown"],
  [NotificationType.ITEM_DELISTED, "face-angry"],
  [NotificationType.BIDBOT_DEACTIVATED_ITEM_DELISTED, "face-angry"],
  [NotificationType.ITEM_NOT_SOLD, "face-frown"],
  [NotificationType.BIDBOT_DEACTIVATED_AUCTION_END, "face-meh"],
])

const colorMap = new Map([
  [NotificationType.WON, "green"],
  [NotificationType.LOST, "red"],
  [NotificationType.OUTBID, "red"],
  [NotificationType.ITEM_BID_ON, "green"],
  [NotificationType.ITEM_SOLD, "green"],
  [NotificationType.BIDBOT_BID, "green"],
  [NotificationType.BIDBOT_DEACTIVATED, "red"],
  [NotificationType.ITEM_DELISTED, "red"],
  [NotificationType.BIDBOT_DEACTIVATED_ITEM_DELISTED, "red"],
  [NotificationType.ITEM_NOT_SOLD, "red"],
  [NotificationType.BIDBOT_DEACTIVATED_AUCTION_END, "grey"],
])

interface LineItemProps {
  notification: Notification
  viewNotification: (id: number) => void
}

function LineItem(props: LineItemProps) {
  const { notification, viewNotification } = props
  const { id, noteType, seen, itemId, price, itemName, userFirstName, userLastName, userEmail } =
    notification

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const dismiss = useCallback(() => {
    if (!seen) {
      dispatch(clearNotifcation())
      viewNotification(id)
      updateSeenNotifications(
        { noteIds: [id] },
        () => {},
        () => {},
      )
    }
  }, [dispatch, id, viewNotification, seen])

  const lineItemContent = (() => {
    const priceStr = `$${safeParseFloat(price)?.toFixed(2)}`

    switch (noteType) {
      case NotificationType.ITEM_BID_ON:
        return (
          <div>
            A bid of {priceStr} was placed on your listing {itemName}.
          </div>
        )
      case NotificationType.WON:
        return (
          <div>
            Congratulations! You won {itemName} for a final bid price of {priceStr}. Please contact{" "}
            {`${userFirstName} ${userLastName} `}
            to arrange an exchange. Their email address is {`${userEmail}`} and they may have more
            contact info listed on their profile page.
          </div>
        )
      case NotificationType.LOST:
        return (
          <div>
            We are sorry to inform you that you lost the auction for {itemName}. We hope you were
            satisfied by your AuctionHouse experience. Any feedback is welcome at
            dev@auctionhouse.com
          </div>
        )
      case NotificationType.ITEM_SOLD:
        return (
          <div>
            Congratulations! Your item {itemName} was sold to {`${userFirstName} ${userLastName}`}{" "}
            for a final price of {priceStr}. Please contact
            {` ${userFirstName} ${userLastName}`} to arrange an exchange. Their email address is{" "}
            {`${userEmail}`} and they may have more contact info listed on their profile page.
          </div>
        )
      case NotificationType.ITEM_NOT_SOLD:
        return (
          <div>
            We are sorry to inform you that your item {itemName} was not sold. We hope you were
            satisfied by your AuctionHouse experience. Any feedback is welcome at
            dev@auctionhouse.com
          </div>
        )
      case NotificationType.OUTBID:
        return (
          <div>
            You have been outbid on {itemName}. The new highest bid is {priceStr}. If you are still
            interested in this item, make sure to submit another bid before the auction ends!
          </div>
        )
      case NotificationType.BIDBOT_BID:
        return (
          <div>
            An automatic bid of {priceStr} was placed on {itemName} on your behalf.
          </div>
        )
      case NotificationType.BIDBOT_DEACTIVATED:
        return (
          <div>
            A bid of {priceStr} was placed on {itemName}, exceeding your automatic bidder&apos;s
            upper limit. As such, your automatic bidder has been deactivated. Make sure to place
            another bid if you are still interested in this item!
          </div>
        )
      case NotificationType.BIDBOT_DEACTIVATED_AUCTION_END:
        return (
          <div>
            Your bidbot for item {itemName} has been deactiveated now that the auction has ended.
          </div>
        )
      case NotificationType.ITEM_DELISTED:
        return <div>{itemName} was delisted by its seller. We apologize for the inconvenience.</div>
      case NotificationType.BIDBOT_DEACTIVATED_ITEM_DELISTED:
        return (
          <div>
            {itemName} was delisted by its seller and your automatic bidder has been deactivated. We
            apologize for the inconvenience.
          </div>
        )
      default:
        return <div />
    }
  })()

  const onClick = () => {
    dismiss()
    let destination = `/my_bids/?id=${itemId}`
    if (
      noteType === NotificationType.ITEM_BID_ON ||
      noteType === NotificationType.ITEM_SOLD ||
      noteType === NotificationType.ITEM_NOT_SOLD
    ) {
      destination = `/my_listings/?id=${itemId}`
    }
    navigate(destination)
  }

  return (
    <div className="notification">
      <div className={`notification-box ${seen ? "" : "unseen"}`}>
        <div className="width-1 text-centered">
          {!seen ? <FontAwesomeIcon icon="circle" color="rgb(24, 118, 242)" /> : null}
        </div>
        <div className="width-1">
          <FontAwesomeIcon icon={iconMap.get(noteType)} size="2x" color={colorMap.get(noteType)} />
        </div>
        <div
          className="width-8 notification-text"
          onClick={onClick}
          onKeyPress={onClick}
          role="link"
          tabIndex={0}
        >
          {lineItemContent}
        </div>
        <div className="width-2 text-centered">
          {!seen ? (
            <Button size="mini" basic color="black" onClick={dismiss}>
              Dismiss
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function NotificationPage() {
  const { user, numUnseenNotifs } = useSelector((state: AppState) => state)
  const [notifications, setNotifcations] = useState<Notification[]>([])
  const dispatch = useDispatch()

  const fetchNotifs = useCallback(() => {
    getNotifications(
      {},
      (notificationResponse: GetNotificationsResponse) => {
        setNotifcations(notificationResponse || [])
        dispatch(
          setData({
            numUnseenNotifs: notificationResponse.filter((notif) => !notif.seen).length,
          }),
        )
      },
      () => {},
    )
  }, [dispatch])

  useEffect(() => {
    if (user) {
      fetchNotifs()
    }
  }, [user, fetchNotifs])

  useEffect(() => {
    if (notifications && notifications.filter((notif) => !notif.seen).length < numUnseenNotifs) {
      fetchNotifs()
    }
  }, [fetchNotifs, notifications, numUnseenNotifs])

  const viewNotification = useCallback(
    (id: number) => {
      setNotifcations(
        notifications.map((notif) => (notif.id === id ? { ...notif, seen: true } : notif)),
      )
    },
    [notifications],
  )

  return (
    <div className="notification-page-outer">
      <div className="notification-page-inner">
        <h1 className="text-centered">Notifications</h1>
        {notifications.map((notification: Notification) => (
          <LineItem
            notification={notification}
            key={notification.id}
            viewNotification={viewNotification}
          />
        ))}
      </div>
    </div>
  )
}
