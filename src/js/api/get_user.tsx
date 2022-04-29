import buildWrappedGet from "../base/api"
import { User } from "../base/reducers"

export type Arguments = {}

export type Response = User

export const apiCall = buildWrappedGet<Arguments, Response>("/api/get_user")
