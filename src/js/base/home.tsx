import * as React from "react"
import { DateTime } from "luxon"
import { Row, Col } from "react-bootstrap"
import Gallery from "./gallery"
import { AppState } from "./reducers"
import { AuctionState } from "./types"
import { useSelector } from "./react_base"
import Countdown from "./countdown"
import StartAuction from "./start_auction"

function Home() {
  const { auction, user } = useSelector((state: AppState) => state)

  /* Case 1: No Auction in DB */
  if (auction?.state === AuctionState.NO_AUCTION) {
    if (user?.id === 1) {
      return <StartAuction />
    }
    return (
      <span style={{ fontSize: "32px" }}>
        No ongoing auctions. Please contact AuctionHouse to start your own community auction.
      </span>
    )
  }
  /* Case 2: Auction in DB that has not started yet */
  if (auction?.state === AuctionState.NOT_STARTED) {
    return (
      <Row>
        <Col xs={12} align="center">
          <br />
          <span style={{ fontSize: "32px" }}>
            The auction will start in{" "}
            <Countdown endTime={DateTime.fromISO(auction?.startTime)} showClock={false} />
          </span>
        </Col>
      </Row>
    )
  }

  if (auction?.state === AuctionState.ACTIVE || auction?.state === AuctionState.COMPLETE) {
    return <Gallery />
  }

  return <div />
}

export default Home
