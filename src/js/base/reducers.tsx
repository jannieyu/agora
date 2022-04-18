export interface User {
  firstName: string
  lastName: string
  email: string
  id: number
}

const initialState = {
  numClicks: 0 as number,
  user: null as User | null,
  showLoginModal: false as boolean,
  isSignUp: true as boolean,
}

export type AppState = typeof initialState

export enum ActionType {
  SET_DATA = "SET_DATA",
}

export type ActionPayload = Partial<AppState>

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
    default: {
      return state
    }
  }
}
