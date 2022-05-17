import buildWrappedGet from "../base/api"

export type Arguments = {
  startTime: string
  endTime: string
}

export type Response = unknown

export const apiCall = buildWrappedGet<Arguments, Response>("/api/create_auction")
