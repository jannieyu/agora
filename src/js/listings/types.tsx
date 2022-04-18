import { User } from "../base/reducers"

export interface ListingProps {
  category: string
  name: string
  highestBid: string
  price: string // starting price
  buyItNowPrice: string
  condition: string
  image: string
  description: string
  seller: User
  id: number
  sellerId?: number
}
