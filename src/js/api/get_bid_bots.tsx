import buildWrappedGet from "../base/api"

export type BidBot = {
  id: number
  itemId: number
  itemName: string
  itemImage: string
  highestItemBid: string
  maxBid: string
  highestBotBid: string
  active: boolean
  activeItem: boolean
}

export type Arguments = {}

export type Response = BidBot[]

export const apiCall = buildWrappedGet<Arguments, Response>("/api/get_bid_bots")
