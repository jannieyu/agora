import buildWrappedGet from "../base/api"
import User from "./user"

export const API_ARGS = {}

export interface BidHistory {
  id?: number
  bidderId: number
  itemId: number
  bidPrice: string
  createdAt: string
}

export interface SearchItem {
  category: string
  condition: string
  description: string
  numBids: number
  highestBid: string
  buyItNowPrice: string
  id: number
  image: string
  name: string
  price: string
  seller: User
  bids: BidHistory[]
}

export type Arguments = typeof API_ARGS
export type Response = SearchItem[]

export const apiCall = buildWrappedGet<Arguments, Response>("/api/get_search_items")
