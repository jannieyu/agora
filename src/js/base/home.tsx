import * as React from "react"
import { DateTime } from "luxon"
import Gallery from "./gallery"
import { AppState } from "./reducers"
import { useSelector } from "./react_base"
import Countdown from "./countdown"

function Home() {
  const { auction, user } = useSelector((state: AppState) => state)

  /* Case 1: No Auction in DB */
  if (!auction?.id) {
    if (user?.id === 1) {
      return <div>START AUCTION</div>
    }
    return <div>No ongoing auctions.</div>
  }
  /* Case 2: Auction in DB that has not started yet */
  if (auction?.id && DateTime.now() < DateTime.fromISO(auction?.startTime)) {
    return (
      <span>
        The auction will start in{" "}
        <Countdown endTime={DateTime.fromISO(auction?.startTime)} showClock={false} />
      </span>
    )
  }

  return <Gallery />
}

export default Home
