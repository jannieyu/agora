import { Auction } from "../base/reducers"
import buildWrappedGet from "../base/api"

export const API_ARGS = {}

export type Arguments = typeof API_ARGS
export type Response = {
  email: string
  firstName: string
  lastName: string
  id: number
  newNotificationCount: number
  auction: Auction
}

export const apiCall = buildWrappedGet<Arguments, Response>("/api/get_login_status")
