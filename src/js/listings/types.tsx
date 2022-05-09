import { BidHistory, User } from "../base/reducers"

export interface ListingProps {
  category: string
  name: string
  highestBid: string
  price: string // starting price
  bids: BidHistory[]
  condition: string
  numBids: number
  image: string
  description: string
  seller: User
  id: number
  active: boolean
  sellerId?: number
  createdAt?: string
  defaultShowHistory?: boolean
  isLocal?: boolean
}

export interface OnChangeObject {
  value: string
}

export enum ActionType {
  SELECT = "select",
  DELETE = "delete",
}
