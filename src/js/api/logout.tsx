import buildWrappedGet from "../base/api"

export type Arguments = null
export type Response = unknown

export const apiCall = buildWrappedGet<Arguments, Response>("/api/logout")
