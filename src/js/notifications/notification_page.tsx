import * as React from "react"
import { Row, Col } from "react-bootstrap"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { useSelector } from "../base/react_base"
import { AppState, Notification, NotificationType } from "../base/reducers"

const iconMap = new Map<NotificationType, IconProp>([
  [NotificationType.WON, "thumbs-up"],
  [NotificationType.LOST, "thumbs-down"],
  [NotificationType.OUTBID, "face-frown"],
  [NotificationType.ITEM_BID_ON, "arrow-up"],
  [NotificationType.ITEM_SOLD, "sack-dollar"],
])

const colorMap = new Map([
  [NotificationType.WON, "green"],
  [NotificationType.LOST, "red"],
  [NotificationType.OUTBID, "red"],
  [NotificationType.ITEM_BID_ON, "green"],
  [NotificationType.ITEM_SOLD, "green"],
])

const messageMap = new Map([
  [NotificationType.WON, "Congratulations! You have won ..."],
  [
    NotificationType.LOST,
    "We are sorry to let you know that the following item has been sold to another user",
  ],
  [NotificationType.OUTBID, "You have been outbid on the following item:"],
  [NotificationType.ITEM_BID_ON, "Your listing ... has been bid on! The current price is ..."],
  [
    NotificationType.ITEM_SOLD,
    "Congratulations, your item ... has been sold to ... at a price of ...!",
  ],
])

function LineItem(props: Notification) {
  const { type, seen } = props

  return (
    <div className="notification">
      <Link to="/">
        <div className={`notification-box ${seen ? "" : "unseen"}`}>
          <Row className="align-items-center">
            <Col xs={1}>
              <FontAwesomeIcon icon={iconMap.get(type)} size="2x" color={colorMap.get(type)} />
            </Col>
            <Col xs={10}>
              <div>{messageMap.get(type)}</div>
            </Col>
            <Col xs={1}>
              {!seen ? <FontAwesomeIcon icon="circle" color="rgb(24, 118, 242)" /> : null}
            </Col>
          </Row>
        </div>
      </Link>
    </div>
  )
}

export default function NotificationPage() {
  const notifications = useSelector((state: AppState) => state.notifications)

  return (
    <Row>
      <Col xs={3} />
      <Col xs={6}>
        <h1 className="column-heading-centered">Notifications</h1>
        {notifications.map((notification: Notification) => (
          <LineItem {...notification} key={notification.id} />
        ))}
      </Col>
      <Col xs={3} />
    </Row>
  )
}
