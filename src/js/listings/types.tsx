import { User } from "../base/reducers"

export interface ListingProps {
  category: string
  name: string
  price: string
  condition: string
  image: string
  description: string
  seller: User
  id: number
  sellerId?: number
}
