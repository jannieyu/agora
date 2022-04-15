import buildWrappedGet from "../base/api"

export type Arguments = {
  id: string
}

export type Response = {}

export const apiCall = buildWrappedGet<Arguments, Response>("/api/delete_item")
