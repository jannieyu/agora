import * as React from "react"
import { render, createStore, Provider, useCallback, useDispatch, useSelector } from "./react_base"
import { rootReducer, AppState } from "./reducers"
import setData from "./actions"
import "./styles.scss"

const App = () => {
  const dispatch = useDispatch()
  const title = useSelector((state: AppState) => state.title)

  const onToggle = useCallback(() => {
    dispatch(
      setData({
        title: title === "World" ? "Earth" : "World",
      }),
    )
  }, [title, dispatch])

  return (
    <div className="app">
      <h1 className="title"> Hello, {title}!</h1>
      <button onClick={onToggle} type="button">
        Toggle
      </button>
    </div>
  )
}

const store = createStore(rootReducer)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("app"),
)
