import buildWrappedGet from "../base/api"
import { Response as LoginStatusResponse } from "./get_login_status"

export type Arguments = {
  email: string
  password: string
  isSignUp: boolean
  firstName?: string
  lastName?: string
}
export type Response = LoginStatusResponse

export const apiCall = buildWrappedGet<Arguments, Response>("/api/login")
