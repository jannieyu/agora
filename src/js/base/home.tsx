import * as React from "react"
import { DateTime } from "luxon"
import Gallery from "./gallery"
import { AppState } from "./reducers"
import { AuctionState } from "./types"
import { useSelector } from "./react_base"
import Countdown from "./countdown"

function Home() {
  const { auction, user } = useSelector((state: AppState) => state)

  /* Case 1: No Auction in DB */
  if (auction?.state === AuctionState.NO_AUCTION) {
    if (user?.id === 1) {
      return <div>START AUCTION</div>
    }
    return <div>No ongoing auctions.</div>
  }
  /* Case 2: Auction in DB that has not started yet */
  if (auction?.state === AuctionState.NOT_STARTED) {
    return (
      <span style={{ fontSize: "32px" }}>
        The auction will start in{" "}
        <Countdown endTime={DateTime.fromISO(auction?.startTime)} showClock={false} />
      </span>
    )
  }

  if (auction?.state === AuctionState.ACTIVE || auction?.state === AuctionState.COMPLETE) {
    return <Gallery />
  }

  return <div />
}

export default Home
