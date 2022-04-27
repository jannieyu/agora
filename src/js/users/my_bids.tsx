import * as React from "react"
import { Row, Col } from "react-bootstrap"
import { Button, Tab } from "semantic-ui-react"
import { useCallback, useEffect, useState } from "../base/react_base"
import { safeParseFloat } from "../base/util"
import { apiCall as getBids, Response as GetBidsResponse, ItemBid } from "../api/get_bids"

function ManualBid(props: ItemBid) {
  const { highestItemBid, highestUserBid, itemName, itemImage } = props

  const highestItemBidStr = `$${safeParseFloat(highestItemBid).toFixed(2)}`
  const highestUserBidStr = `$${safeParseFloat(highestUserBid).toFixed(2)}`

  const onClick = useCallback(() => {}, [])

  return (
    <Row className="my_bids align-items-center" onClick={onClick}>
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
        <Button positive>Place Bid</Button>
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
