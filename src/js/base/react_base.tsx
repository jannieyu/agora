import * as React from "react"
import { useCallback, useEffect, useState } from "react"
import { render } from "react-dom"
import { createStore } from "redux"
import { Provider, useDispatch, useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

export {
  render,
  useCallback,
  useDispatch,
  useSelector,
  useTranslation,
  createStore,
  useEffect,
  useState,
  Provider,
}

export type AppState = unknown

export interface Action {
  type: unknown
  payload: unknown
}

export const makeApp = (
  App: React.ComponentType,
  reducer: (state: AppState, action: Action) => AppState,
) => {
  const store = createStore(reducer)
  return function Wrapped() {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    )
  }
}
