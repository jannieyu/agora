import buildWrappedGet from "../base/api"
import { SearchItem } from "../base/reducers"

export enum SEARCH_CATEGORY {}

export type Arguments = {
  category?: string
  condition?: string
  sort?: string
  search?: string
  sellerItemsOnly?: boolean
}
export type Response = SearchItem[]

export const apiCall = buildWrappedGet<Arguments, Response>("/api/get_search_items")
