import * as React from "react"
import { useCallback } from "react"
import { render } from "react-dom"
import { createStore } from "redux"
import { Provider, useDispatch, useSelector } from "react-redux"

export { render, createStore, useCallback, useDispatch, useSelector, Provider }

export type AppState = unknown

export interface Action {
  type: unknown
  payload: unknown
}

export const makeApp = (App, reducer: (state: AppState, action: Action) => AppState) => {
  const store = createStore(reducer)
  return function Wrapped() {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    )
  }
}
