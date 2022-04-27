import * as React from "react"
import { Row, Col } from "react-bootstrap"
import { Button, Tab } from "semantic-ui-react"
import { AppState } from "../base/reducers"
import { useCallback, useEffect, useSelector, useState } from "../base/react_base"
import { safeParseFloat } from "../base/util"
import { calculateIncrement } from "../listings/util"
import { apiCall as getBids, Response as GetBidsResponse, ItemBid } from "../api/get_bids"
import { apiCall as getBidBots, Response as GetBidBotsResponse, BidBot } from "../api/get_bid_bots"
import BidModal from "./bid_modal"

type AutomaticBidProps = BidBot & {
  anyDeactivated: boolean
}

function AutomaticBid(props: AutomaticBidProps) {
  const {
    highestItemBid,
    highestBotBid,
    itemId,
    itemName,
    itemImage,
    maxBid,
    active,
    anyDeactivated,
  } = props

  const { user } = useSelector((state: AppState) => state)

  const price = safeParseFloat(highestItemBid)
  const minIncrement = calculateIncrement(price)

  const highestItemBidStr = `$${safeParseFloat(highestItemBid).toFixed(2)}`
  const highestUserBidStr = `$${safeParseFloat(highestBotBid).toFixed(2)}`
  const maxBidStr = `$${safeParseFloat(maxBid).toFixed(2)}`

  const [showBidModal, setShowBidModal] = useState<boolean>(false)

  const openPlaceBidModal = useCallback(() => {
    setShowBidModal(true)
  }, [])

  const hideBidModal = useCallback(() => {
    setShowBidModal(false)
  }, [])

  return (
    <div className="my_bids auto_bids align-items-center justify-space-between">
      <BidModal
        show={showBidModal}
        onHide={hideBidModal}
        price={price}
        numBids={1}
        bidderId={user.id}
        itemId={itemId}
        minIncrement={minIncrement}
        handleSuccess={() => {}}
        isAutomatic
      />
      <Col xs={2}>
        <img src={`/${itemImage}`} alt="Listing Preview" />
      </Col>
      <div>
        <b>{itemName}</b>
      </div>
      <div>
        <div>Your Top Bid:</div>
        <strong>{highestUserBidStr}</strong>
      </div>
      <div>
        <div>Top Overall Bid:</div>
        <strong>{highestItemBidStr}</strong>
      </div>
      <div>
        <div>Bot Upper Limit:</div>
        <strong>{maxBidStr}</strong>
      </div>
      <div>
        <div>Status</div>
        {active ? (
          <strong className="winning">Active</strong>
        ) : (
          <strong className="losing">Deactivated</strong>
        )}
      </div>
      {anyDeactivated ? (
        <Col xs={2}>
          {!active ? (
            <Button positive onClick={openPlaceBidModal}>
              Place Bid
            </Button>
          ) : null}
        </Col>
      ) : null}
    </div>
  )
}

type ManualBidProps = ItemBid & {
  anyLosing: boolean
}

function ManualBid(props: ManualBidProps) {
  const { highestItemBid, highestUserBid, itemId, itemName, itemImage, anyLosing } = props

  const { user } = useSelector((state: AppState) => state)

  const price = safeParseFloat(highestItemBid)
  const minIncrement = calculateIncrement(price)

  const highestItemBidStr = `$${safeParseFloat(highestItemBid).toFixed(2)}`
  const highestUserBidStr = `$${safeParseFloat(highestUserBid).toFixed(2)}`

  const [showBidModal, setShowBidModal] = useState<boolean>(false)

  const openPlaceBidModal = useCallback(() => {
    setShowBidModal(true)
  }, [])

  const hideBidModal = useCallback(() => {
    setShowBidModal(false)
  }, [])

  const winning = safeParseFloat(highestUserBid) === safeParseFloat(highestItemBid)

  return (
    <Row className="my_bids align-items-center">
      <BidModal
        show={showBidModal}
        onHide={hideBidModal}
        price={price}
        numBids={1}
        bidderId={user.id}
        itemId={itemId}
        minIncrement={minIncrement}
        handleSuccess={() => {}}
        isAutomatic={false}
      />
      <Col xs={anyLosing ? 2 : 3} align="center">
        <img src={`/${itemImage}`} alt="Listing Preview" />
      </Col>
      <Col xs={anyLosing ? 2 : 3}>
        <b>{itemName}</b>
      </Col>
      <Col xs={2}>
        <div>Your Top Bid:</div>
        <strong>{highestUserBidStr}</strong>
      </Col>
      <Col xs={2}>
        <div>Top Overall Bid:</div>
        <strong>{highestItemBidStr}</strong>
      </Col>
      <Col xs={2}>
        <div>Status</div>
        {winning ? (
          <strong className="winning">Winning</strong>
        ) : (
          <strong className="losing">Losing</strong>
        )}
      </Col>
      {anyLosing ? (
        <Col xs={2}>
          {!winning ? (
            <Button positive onClick={openPlaceBidModal}>
              Place Bid
            </Button>
          ) : null}
        </Col>
      ) : null}
    </Row>
  )
}

export default function MyBids() {
  const [bids, setBids] = useState<ItemBid[]>([])
  const [bidBots, setBidBots] = useState<BidBot[]>([])

  useEffect(() => {
    getBids(
      {},
      (bidsResponse: GetBidsResponse) => {
        setBids(bidsResponse)
      },
      () => {},
    )
    getBidBots(
      {},
      (bidBotsResponse: GetBidBotsResponse) => {
        setBidBots(bidBotsResponse)
      },
      () => {},
    )
  }, [])

  const anyLosing = bids.some(
    (bid: ItemBid) => safeParseFloat(bid.highestUserBid) < safeParseFloat(bid.highestItemBid),
  )

  const manualBids = bids.map((bid: ItemBid) => (
    <ManualBid key={bid.itemId} {...bid} anyLosing={anyLosing} />
  ))

  const anyDeactivated = bidBots.some((bidBot: BidBot) => !bidBot.active)

  const autoBids = bidBots.map((bidBot: BidBot) => (
    <AutomaticBid key={bidBot.id} {...bidBot} anyDeactivated={anyDeactivated} />
  ))

  const panes = [
    {
      menuItem: "Manual Bids",
      render: () => (
        <div>
          {manualBids.length ? (
            manualBids
          ) : (
            <div>
              <br />
              You have not created any manual bids yet.
            </div>
          )}
        </div>
      ),
    },
    {
      menuItem: "Automatic Bids",
      render: () => (
        <div>{autoBids.length ? autoBids : "You have not created any automatic bids yet."}</div>
      ),
    },
  ]

  return (
    <Row>
      <h1 className="column-heading-centered">My Bids</h1>
      <Col xs={2} />
      <Col xs={8} align="center">
        <br />
        <Tab panes={panes} />
      </Col>
      <Col xs={2} />
    </Row>
  )
}
