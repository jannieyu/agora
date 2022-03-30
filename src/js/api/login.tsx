import buildWrappedGet from "../base/api"

export const API_ARGS = {
  email: "rclark@caltech.edu",
  password: "password123",
}

export type Arguments = typeof API_ARGS
export type Response = unknown

export const apiCall = buildWrappedGet<Arguments, Response>("/api/login")
