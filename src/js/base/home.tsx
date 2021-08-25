import * as React from "react"
import { useCallback, useDispatch, useSelector, makeApp } from "./react_base"
import { rootReducer, AppState } from "./reducers"
import setData from "./actions"

const Home = () => {
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

export default makeApp(Home, rootReducer)
