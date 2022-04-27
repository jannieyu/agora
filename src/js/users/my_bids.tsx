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
        <div>Your Highest Bid:</div>
        <strong>{highestUserBidStr}</strong>
      </Col>
      <Col xs={2}>
        <div>Highest Overall Bid:</div>
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

function AutomaticBid() {
  return <div />
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

  const autoBids = bidBots.map((bid: BidBot) => <AutomaticBid key={bid.id} {...bid} />)

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
      <h1 className="column-heading-centered">Your Bids</h1>
      <Col xs={2} />
      <Col xs={8} align="center">
        <br />
        <Tab panes={panes} />
      </Col>
      <Col xs={2} />
    </Row>
  )
}
