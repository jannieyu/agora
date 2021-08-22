const initialState = {
  header: "Hello, World!" as string,
}

type AppState = typeof initialState

type SetDataPayload = Partial<AppState>

export enum ActionTypes {
  SET_DATA = "SET_DATA",
}

export interface Action {
  type: ActionTypes
  payload: SetDataPayload
}

export const rootReducer = (state: AppState = initialState, action: Action) => {
  switch (action.type) {
    case ActionTypes.SET_DATA: {
      return { ...state, ...action.payload }
    }
    default: {
      return state
    }
  }
}
