import * as React from "react"
import { useCallback, useDispatch, useSelector, useTranslation, makeApp } from "./react_base"
import { rootReducer, AppState } from "./reducers"
import setData from "./actions"

const Home = () => {
  const { t } = useTranslation()
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
      <h1 className="title"> {t(`Hello ${title}`!)}</h1>
      <button onClick={onToggle} type="button">
        {t("Toggle")}
      </button>
      &nbsp;
      <a href="./about">{t("About this site")}</a>
    </div>
  )
}

export default makeApp(Home, rootReducer)
