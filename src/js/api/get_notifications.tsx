import buildWrappedGet from "../base/api"
import { Notification } from "../base/reducers"

export type Arguments = {}

export type Response = Notification[]

export const apiCall = buildWrappedGet<Arguments, Response>("/api/get_notifications")
