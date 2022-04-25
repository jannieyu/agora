import buildWrappedGet from "../base/api"

export type Arguments = {
  itemId: number
  maxBid: string
}

export type Response = unknown

export const apiCall = buildWrappedGet<Arguments, Response>("/api/add_bid_bot")
