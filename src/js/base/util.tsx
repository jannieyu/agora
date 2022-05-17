import { useEffect, DependencyList } from "react"
import { DateTime } from "luxon"
import { Auction, AuctionState } from "./types"

export function safeParseFloat(input: string | null | undefined) {
  if (input) {
    return parseFloat(input)
  }
  return null
}

export function safeParseInt(input: string | null | undefined) {
  if (input) {
    return parseInt(input, 10)
  }
  return null
}

export function useDebounceEffect(fn: () => void, waitTime: number, deps?: DependencyList) {
  useEffect(() => {
    const t = setTimeout(() => {
      // eslint-disable-next-line prefer-spread
      fn.apply(undefined, deps)
    }, waitTime)

    return () => {
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps])
}

export function determineAuctionState(auction: Auction) {
  if (!auction?.id) {
    return AuctionState.NO_AUCTION
  }
  if (auction?.id && DateTime.now() < DateTime.fromISO(auction.startTime)) {
    return AuctionState.NOT_STARTED
  }
  if (auction?.id && DateTime.now() < DateTime.fromISO(auction.endTime)) {
    return AuctionState.ACTIVE
  }
  return AuctionState.COMPLETE
}
