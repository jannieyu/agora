import buildWrappedGet from "../base/api"

export type Arguments = {
  itemId: number
}

export type Response = {}

export const apiCall = buildWrappedGet<Arguments, Response>("/api/delist_item")
