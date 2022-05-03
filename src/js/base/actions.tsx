import { BidHistory, SearchItem, ActionType, ActionPayload, ListingState } from "./reducers"

export const setData = (data: ActionPayload) => ({
  type: ActionType.SET_DATA,
  payload: data,
})

export const updateSearchItem = (
  data: Partial<SearchItem>,
  itemId: number,
  newBid?: BidHistory,
) => ({
  type: ActionType.UPDATE_SEARCH_ITEM,
  payload: { data, itemId, newBid },
})

export const updateListingState = (data: Partial<ListingState>) => ({
  type: ActionType.UPDATE_LISTING_STATE,
  payload: data,
})

export const clearListingState = () => ({ type: ActionType.CLEAR_LISTING_STATE })

export const clearNotifcation = () => ({ type: ActionType.CLEAR_NOTIFICATION })

export const receiveNotification = () => ({ type: ActionType.RECEIVE_NOTIFICATION })
