import * as React from "react"
import { Row, Col } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { Button } from "semantic-ui-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { useCallback, useDispatch, useSelector } from "../base/react_base"
import { AppState, Notification, NotificationType } from "../base/reducers"
import { updateNotification } from "../base/actions"
import { safeParseFloat } from "../base/util"
import { apiCall as updateSeenNotifications } from "../api/update_seen_notifications"

const iconMap = new Map<NotificationType, IconProp>([
  [NotificationType.WON, "thumbs-up"],
  [NotificationType.LOST, "thumbs-down"],
  [NotificationType.OUTBID, "face-frown"],
  [NotificationType.ITEM_BID_ON, "arrow-up"],
  [NotificationType.ITEM_SOLD, "sack-dollar"],
  [NotificationType.BIDBOT_BID, "arrow-up"],
  [NotificationType.BIDBOT_DEACTIVATED, "face-frown"],
])

const colorMap = new Map([
  [NotificationType.WON, "green"],
  [NotificationType.LOST, "red"],
  [NotificationType.OUTBID, "red"],
  [NotificationType.ITEM_BID_ON, "green"],
  [NotificationType.ITEM_SOLD, "green"],
  [NotificationType.BIDBOT_BID, "green"],
  [NotificationType.BIDBOT_DEACTIVATED, "red"],
])

function LineItem(props: Notification) {
  const { id, noteType, seen, itemId, price, itemName, user } = props

  const navigate = useNavigate()
  const dispatch = useDispatch()

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
            Congratulations! You won {itemName} for a final bid price of
            {priceStr} Please contact {`${user?.firstName} ${user?.lastName}`} to arrange an
            exchange. Their email address is {`${user?.email}`} and they may have more contact info
            listed on their profile page.
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
            Congratulations! Your item {itemName} was sold to{" "}
            {`${user?.firstName} ${user?.lastName}`} for a final price of {priceStr}. Please contact
            {`${user?.firstName} ${user?.lastName}`} to arrange an exchange. Their email address is{" "}
            {`${user?.email}`} and they may have more contact info listed on their profile page.
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
      default:
        return <div />
    }
  })()

  const dismiss = useCallback(() => {
    dispatch(updateNotification({ seen: true }, id))
    updateSeenNotifications(
      { noteIds: [id] },
      () => {},
      () => {},
    )
  }, [dispatch, id])

  const onClick = () => {
    dismiss()
    let destination = `/?itemId=${itemId}`
    if (noteType === NotificationType.ITEM_BID_ON) {
      destination = `/my_listings/?id=${itemId}`
    }
    navigate(destination)
  }

  return (
    <div className="notification">
      <div className={`notification-box ${seen ? "" : "unseen"}`}>
        <Row className="align-items-center">
          <Col xs={1} className="column-heading-centered">
            {!seen ? <FontAwesomeIcon icon="circle" color="rgb(24, 118, 242)" /> : null}
          </Col>
          <Col xs={1}>
            <FontAwesomeIcon
              icon={iconMap.get(noteType)}
              size="2x"
              color={colorMap.get(noteType)}
            />
          </Col>
          <Col
            xs={8}
            className="notification-text"
            onClick={onClick}
            onKeyPress={onClick}
            role="link"
            tabIndex={0}
          >
            {lineItemContent}
          </Col>

          <Col xs={2} className="column-heading-centered">
            {!seen ? (
              <Button size="mini" basic color="black" onClick={dismiss}>
                Dismiss
              </Button>
            ) : null}
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default function NotificationPage() {
  const notifications = useSelector((state: AppState) => state.notifications)

  return (
    <Row>
      <Col xs={2} />
      <Col xs={8}>
        <h1 className="column-heading-centered">Notifications</h1>
        {notifications.map((notification: Notification) => (
          <LineItem {...notification} key={notification.id} />
        ))}
      </Col>
      <Col xs={2} />
    </Row>
  )
}
