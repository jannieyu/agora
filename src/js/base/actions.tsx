import { ActionType, ActionPayload } from "./reducers"

export const setData = (data: ActionPayload) => ({
  type: ActionType.SET_DATA,
  payload: data,
})

export const updateSearchItem = (data: ActionPayload, itemId: number) => ({
  type: ActionType.UPDATE_SEARCH_ITEM,
  payload: data,
  itemId,
})
