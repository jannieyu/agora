import * as React from "react"
import { Row, Col } from "react-bootstrap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "../base/react_base"
import { safeParseFloat } from "../base/util"
import { apiCall as getBids, Response as GetBidsResponse, ItemBid } from "../api/get_bids"

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

  const tableRows = bids.map((bid: ItemBid) => (
    <tr
      key={bid.itemId}
      className={`${bid.highestItemBid > bid.highestUserBid ? "losing" : "winning"}`}
    >
      <td>
        <div className="item-view">
          <img src={`/${bid.itemImage}`} alt="Listing" />
          <b>{bid.itemName}</b>
        </div>
      </td>
      <td>{`$${safeParseFloat(bid.highestUserBid).toFixed(2)}`}</td>
      <td>{`$${safeParseFloat(bid.highestItemBid).toFixed(2)}`}</td>
      <td>
        {safeParseFloat(bid.highestUserBid) === safeParseFloat(bid.highestItemBid) ? (
          <FontAwesomeIcon icon="thumbs-up" size="3x" color="green" />
        ) : (
          <FontAwesomeIcon icon="thumbs-down" size="3x" color="red" />
        )}
      </td>
    </tr>
  ))

  return (
    <Row>
      <h1 className="column-heading-centered">Your Bids</h1>
      <Col xs={2} />
      <Col xs={8} align="center">
        <br />
        <table className="my-bids-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>My Highest Bid</th>
              <th>Highest Overall Bid</th>
              <th>Winning?</th>
            </tr>
          </thead>
          <tbody>{tableRows}</tbody>
        </table>
      </Col>
      <Col xs={2} />
    </Row>
  )
}
