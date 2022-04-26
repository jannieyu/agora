import buildWrappedGet from "../base/api"

export type Arguments = {
  noteIds: number[]
}

export type Response = {}

export const apiCall = buildWrappedGet<Arguments, Response>("/api/update_seen_notifications")
