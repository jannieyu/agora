import buildWrappedGet from "../base/api"

export type Arguments = {
  email: string
  password: string
  isSignUp: boolean
  firstName?: string
  lastName?: string
}
export type Response = unknown

export const apiCall = buildWrappedGet<Arguments, Response>("/api/login")
