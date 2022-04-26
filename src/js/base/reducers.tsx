import { BidHistory, SearchItem } from "../api/get_search_items"

export interface User {
  firstName: string
  lastName: string
  email: string
  id: number
}

export interface ItemInfo {
  name: string
  highestBid: string
  id: number
}

export enum NotificationType {
  OUTBID = "OUTBID",
  WON = "WON",
  LOST = "LOST",
  ITEM_BID_ON = "ITEM_BID_ON",
  ITEM_SOLD = "ITEM_SOLD",
}

export interface Notification {
  noteType: NotificationType
  id: number
  seen: boolean
  itemId?: number
  userId?: number
  price?: string

  user?: User
  itemInfo?: ItemInfo
}

const initialState = {
  numClicks: 0 as number,
  user: null as User | null,
  showLoginModal: false as boolean,
  isSignUp: true as boolean,
  searchItems: [] as SearchItem[],
  notifications: [] as Notification[],
}

export type AppState = typeof initialState

export enum ActionType {
  SET_DATA = "SET_DATA",
  UPDATE_SEARCH_ITEM = "UPDATE_SEARCH_ITEM",
  CREATE_NOTIFICATION = "CREATE_NOTIFICATION",
  UPDATE_NOTIFICATION = "UPDATE_NOTIFICATION",
}

export type SearchItemAction = {
  data: Partial<SearchItem>
  itemId: number
  newBid?: BidHistory
}

export type NotificationAction = {
  data: Partial<Notification>
  notificationId: number
}

export type ActionPayload = Partial<AppState> | SearchItemAction | Notification | NotificationAction

export interface Action {
  type: ActionType
  payload: ActionPayload
}

// eslint-disable-next-line default-param-last
export const rootReducer = (state: AppState = initialState, action: Action) => {
  switch (action.type) {
    case ActionType.SET_DATA: {
      return { ...state, ...action.payload }
    }
    case ActionType.UPDATE_SEARCH_ITEM: {
      const { data, itemId, newBid } = action.payload as SearchItemAction
      return {
        ...state,
        searchItems: state.searchItems.map((item: SearchItem) =>
          item.id === itemId
            ? {
                ...item,
                ...data,
                bids: newBid ? [...item.bids, newBid] : item.bids,
              }
            : item,
        ),
      }
    }
    case ActionType.CREATE_NOTIFICATION: {
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      }
    }
    case ActionType.UPDATE_NOTIFICATION: {
      const { data, notificationId } = action.payload as NotificationAction
      return {
        ...state,
        notifications: state.notifications.map((notification: Notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                ...data,
              }
            : notification,
        ),
      }
    }
    default: {
      return state
    }
  }
}
