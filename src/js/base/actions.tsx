import { ActionType, ActionPayload } from "./reducers"

const setData = (data: ActionPayload) => ({
  type: ActionType.SET_DATA,
  payload: data,
})

export default setData
