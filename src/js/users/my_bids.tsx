import * as React from "react"
import { Row, Col } from "react-bootstrap"
import { Button, Tab } from "semantic-ui-react"
import { AppState } from "../base/reducers"
import { useCallback, useEffect, useSelector, useState } from "../base/react_base"
import { safeParseFloat } from "../base/util"
import { calculateIncrement } from "../listings/util"
import { apiCall as getBids, Response as GetBidsResponse, ItemBid } from "../api/get_bids"
import BidModal from "./bid_modal"

function ManualBid(props: ItemBid) {
  const { highestItemBid, highestUserBid, itemId, itemName, itemImage } = props

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
      <Col xs={2} align="center">
        <img src={`/${itemImage}`} alt="Listing Preview" />
      </Col>
      <Col xs={2}>
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
        <div>Status?</div>
        {safeParseFloat(highestUserBid) === safeParseFloat(highestItemBid) ? (
          <strong className="winning">Winning</strong>
        ) : (
          <strong className="losing">Losing</strong>
        )}
      </Col>
      <Col xs={2}>
        <Button positive onClick={openPlaceBidModal}>
          Place Bid
        </Button>
      </Col>
    </Row>
  )
}

export default function MyBids() {
  const [bids, setBids] = useState<ItemBid[]>([])

  useEffect(() => {
    getBids(
      {},
      (bidsResponse: GetBidsResponse) => {
        setBids(bidsResponse)
      },
      () => {},
    )
  }, [])

  const manualBids = bids.map((bid: ItemBid) => <ManualBid key={bid.itemId} {...bid} />)

  const panes = [
    {
      menuItem: "Manual Bids",
      render: () => <div>{manualBids}</div>,
    },
    {
      menuItem: "Automatic Bids",
      render: () => <div>{manualBids}</div>,
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
