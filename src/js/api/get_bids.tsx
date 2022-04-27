import buildWrappedGet from "../base/api"

export type ItemBid = {
  itemId: number
  itemName: string
  itemImage: string
  highestItemBid: string
  highestUserBid: string
}

export type Arguments = {}

export type Response = ItemBid[]

export const apiCall = buildWrappedGet<Arguments, Response>("/api/get_bids")
