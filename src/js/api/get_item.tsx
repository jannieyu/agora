import buildWrappedGet from "../base/api"
import { SearchItem } from "../base/reducers"

export type Arguments = {
  itemId: number
}

export type Response = SearchItem[]

export const apiCall = buildWrappedGet<Arguments, Response>("/api/get_item")
