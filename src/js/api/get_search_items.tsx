import buildWrappedGet from "../base/api"
import { SearchItem } from "../base/reducers"

export const API_ARGS = {}

export type Arguments = typeof API_ARGS
export type Response = SearchItem[]

export const apiCall = buildWrappedGet<Arguments, Response>("/api/get_search_items")
