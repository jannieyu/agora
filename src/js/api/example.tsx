import buildWrappedGet from "../base/api"

export const API_ARGS = {
  name: "Scooter",
  animalType: {
    species: "dog",
    color: "grey",
  },
}

export type Arguments = typeof API_ARGS
export type Response = unknown

export const apiCall = buildWrappedGet<Arguments, Response>("/api")
