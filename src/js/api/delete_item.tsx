import buildWrappedGet from "../base/api"

export type Arguments = {
  id: number
}

export type Response = {}

export const apiCall = buildWrappedGet<Arguments, Response>("/api/delete_item")
