export enum AuctionState {
  NO_AUCTION = "NO_AUCTION",
  NOT_STARTED = "NOT_STARTED",
  ACTIVE = "ACTIVE",
  COMPLETE = "COMPLETE",
}

export interface Auction {
  id?: number
  startTime: string
  endTime: string
  state?: AuctionState
}
