import {
  BidHistory,
  SearchItem,
  ActionType,
  ActionPayload,
  Notification,
  ListingState,
} from "./reducers"

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

export const createNotification = (data: Notification) => ({
  type: ActionType.CREATE_NOTIFICATION,
  payload: data,
})

export const updateNotification = (data: Partial<Notification>, notificationId: number) => ({
  type: ActionType.UPDATE_NOTIFICATION,
  payload: { data, notificationId },
})

export const updateListingState = (data: Partial<ListingState>) => ({
  type: ActionType.UPDATE_LISTING_STATE,
  payload: data,
})

export const clearListingState = () => ({ type: ActionType.CLEAR_LISTING_STATE })
