import { SearchItem } from "../api/get_search_items"

export interface User {
  firstName: string
  lastName: string
  email: string
  id: number
}

export enum NotificationType {
  OUTBID = "OUTBID",
  WINNER = "WINNER",
  LOSER = "LOSER",
  ITEM_BID_ON = "ITEM_BID_ON",
}

export interface Notification {
  type: NotificationType
  itemId: number
  userId?: number
}

const initialState = {
  numClicks: 0 as number,
  user: null as User | null,
  showLoginModal: false as boolean,
  isSignUp: true as boolean,
  searchItems: [] as SearchItem[],
  notifications: Array(123) as Notification[],
}

export type AppState = typeof initialState

export enum ActionType {
  SET_DATA = "SET_DATA",
  UPDATE_SEARCH_ITEM = "UPDATE_SEARCH_ITEM",
}

export type ActionPayload = Partial<AppState> | Partial<SearchItem>

export interface Action {
  type: ActionType
  payload: ActionPayload
  itemId?: number
}

// eslint-disable-next-line default-param-last
export const rootReducer = (state: AppState = initialState, action: Action) => {
  switch (action.type) {
    case ActionType.SET_DATA: {
      return { ...state, ...action.payload }
    }
    case ActionType.UPDATE_SEARCH_ITEM: {
      return {
        ...state,
        searchItems: state.searchItems.map((item: SearchItem) =>
          item.id === action.itemId ? { ...item, ...action.payload } : item,
        ),
      }
    }
    default: {
      return state
    }
  }
}
