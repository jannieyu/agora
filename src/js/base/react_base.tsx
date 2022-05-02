import * as React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { render } from "react-dom"
import { configureStore } from "@reduxjs/toolkit"
import { Provider, useDispatch, useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

export {
  render,
  useCallback,
  useDispatch,
  useMemo,
  useSelector,
  useTranslation,
  configureStore,
  useEffect,
  useRef,
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
  const store = configureStore({ reducer })
  return function Wrapped() {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    )
  }
}
