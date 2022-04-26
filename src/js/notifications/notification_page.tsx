import * as React from "react"
import { Row, Col } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { useDispatch, useSelector } from "../base/react_base"
import { AppState, Notification, NotificationType } from "../base/reducers"
import { updateNotification } from "../base/actions"
import { safeParseFloat } from "../base/util"

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

function LineItem(props: Notification) {
  const { id, type, seen, itemId, itemInfo, user } = props

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const lineItemContent = (() => {
    const price = `$${safeParseFloat(itemInfo?.highestBid)?.toFixed(2)}`

    switch (type) {
      case NotificationType.ITEM_BID_ON:
        return (
          <div>
            A bid of {price} was placed on your listing {`${itemInfo?.name}`}.
          </div>
        )
      case NotificationType.WON:
        return (
          <div>
            Congratulations! You won {`${itemInfo?.name}`} for a final bid price of
            {price} Please contact {`${user?.firstName} ${user?.lastName}`} to arrange an exchange.
            Their email address is {`${user?.email}`} and they may have more contact info listed on
            their profile page.
          </div>
        )
      case NotificationType.LOST:
        return (
          <div>
            We are sorry to inform you that you lost the auction for {`${itemInfo?.name}`}. We hope
            you were satisfied by your AuctionHouse experience. Any feedback is welcome at
            dev@auctionhouse.com
          </div>
        )
      case NotificationType.ITEM_SOLD:
        return (
          <div>
            Congratulations! Your item {`${itemInfo?.name}`} was sold to{" "}
            {`${user?.firstName} ${user?.lastName}`} for a final price of {price}. Please contact
            {`${user?.firstName} ${user?.lastName}`} to arrange an exchange. Their email address is{" "}
            {`${user?.email}`} and they may have more contact info listed on their profile page.
          </div>
        )
      case NotificationType.OUTBID:
        return (
          <div>
            You have been outbid on {`${itemInfo?.name}`}. The new highest bid is {price}. If you
            are still interested in this item, make sure to submit another bid before the auction
            ends!
          </div>
        )
      default:
        return <div />
    }
  })()

  const onClick = () => {
    dispatch(updateNotification({ seen: true }, id))
    if (type === NotificationType.OUTBID) {
      navigate(`/?itemId=${itemId}`)
    }
  }

  return (
    <div className="notification">
      <div
        className={`notification-box ${seen ? "" : "unseen"}`}
        onClick={onClick}
        onKeyPress={onClick}
        role="link"
        tabIndex={0}
      >
        <Row className="align-items-center">
          <Col xs={1}>
            <FontAwesomeIcon icon={iconMap.get(type)} size="2x" color={colorMap.get(type)} />
          </Col>
          <Col xs={10}>{lineItemContent}</Col>
          <Col xs={1}>
            {!seen ? <FontAwesomeIcon icon="circle" color="rgb(24, 118, 242)" /> : null}
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
