export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  bio?: string
  image?: string
}

export enum NotificationType {
  OUTBID = "OUTBID",
  WON = "WON",
  LOST = "LOST",
  ITEM_BID_ON = "ITEM_BID_ON",
  ITEM_SOLD = "ITEM_SOLD",
  BIDBOT_DEACTIVATED = "BIDBOT_DEACTIVATED",
  BIDBOT_BID = "BIDBOT_BID",
  ITEM_DELISTED = "ITEM_DELISTED",
  BIDBOT_DEACTIVATED_ITEM_DELISTED = "BIDBOT_DEACTIVATED_ITEM_DELISTED",
}

export interface Notification {
  noteType: NotificationType
  id: number
  seen: boolean
  itemId?: number
  userId?: number
  price?: string

  user?: User
  itemName?: string
}

export interface BidHistory {
  id?: number
  bidderId: number
  itemId: number
  bidPrice: string
  createdAt: string
}

export interface ListingState {
  name: string
  startingPrice: string
  category: string
  condition: string
  description: string
  imageURL: string
  bids: BidHistory[]
  highestBid: string
  sellerId: number
}
export interface SearchItem {
  category: string
  condition: string
  description: string
  numBids: number
  highestBid: string
  id: number
  image: string
  name: string
  price: string
  seller: User
  sellerId: number
  active: boolean
  bids: BidHistory[]
}

const initialState = {
  numClicks: 0 as number,
  user: null as User | null,
  showLoginModal: false as boolean,
  isSignUp: true as boolean,
  searchItems: [] as SearchItem[],
  notifications: [] as Notification[],
  listingState: {} as ListingState,
}

export type AppState = typeof initialState

export enum ActionType {
  SET_DATA = "SET_DATA",
  UPDATE_SEARCH_ITEM = "UPDATE_SEARCH_ITEM",
  CREATE_NOTIFICATION = "CREATE_NOTIFICATION",
  UPDATE_NOTIFICATION = "UPDATE_NOTIFICATION",
  UPDATE_LISTING_STATE = "UPDATE_LISTING_STATE",
  CLEAR_LISTING_STATE = "CLEAR_LISTING_STATE",
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

export type ActionPayload =
  | Partial<AppState>
  | SearchItemAction
  | Notification
  | NotificationAction
  | Partial<ListingState>

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
    case ActionType.UPDATE_LISTING_STATE: {
      const listingState = action.payload as ListingState
      return {
        ...state,
        listingState: { ...state.listingState, ...listingState },
      }
    }
    case ActionType.CLEAR_LISTING_STATE: {
      return {
        ...state,
        listingState: {},
      }
    }
    default: {
      return state
    }
  }
}
