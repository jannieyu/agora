import * as React from "react"
import { Row, Col } from "react-bootstrap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { useSelector } from "../base/react_base"
import { AppState, Notification, NotificationType } from "../base/reducers"

const iconMap = new Map<NotificationType, IconProp>([
  [NotificationType.WINNER, "thumbs-up"],
  [NotificationType.LOSER, "thumbs-down"],
  [NotificationType.OUTBID, "face-frown"],
  [NotificationType.ITEM_BID_ON, "arrow-up"],
  [NotificationType.ITEM_SOLD, "sack-dollar"],
])

const colorMap = new Map([
  [NotificationType.WINNER, "green"],
  [NotificationType.LOSER, "red"],
  [NotificationType.OUTBID, "red"],
  [NotificationType.ITEM_BID_ON, "green"],
  [NotificationType.ITEM_SOLD, "green"],
])

const messageMap = new Map([
  [NotificationType.WINNER, "Congratulations! You have won ..."],
  [
    NotificationType.LOSER,
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
  const { type } = props

  return (
    <>
      <Row className="align-items-center">
        <Col xs={3}>
          <FontAwesomeIcon icon={iconMap.get(type)} size="3x" color={colorMap.get(type)} />
        </Col>
        <Col xs={9}>
          <div>{messageMap.get(type)}</div>
        </Col>
      </Row>
      <hr />
    </>
  )
}

export default function NotificationPage() {
  const notifications = useSelector((state: AppState) => state.notifications)

  return (
    <Row>
      <Col xs={3} />
      <Col xs={6}>
        <h1 className="column-heading-centered">Notifications</h1>
        <hr />
        {notifications.map((notification: Notification) => (
          <LineItem {...notification} key={notification.id} />
        ))}
      </Col>
      <Col xs={3} />
    </Row>
  )
}
