import * as React from "react"
import { Button } from "./ui/inputs"
import { Container, Grid } from "./ui/layout"
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
    <Container className="app">
      <Grid container>
        <Grid item xs={12}>
          <h1 className="title"> {t(`Hello ${title}`!)}</h1>
        </Grid>
        <Grid item xs={6}>
          <Button onClick={onToggle} variant="contained">
            {t("Toggle")}
          </Button>
        </Grid>
        <Grid item xs={6}>
          <a href="./about">{t("About this site")}</a>
        </Grid>
      </Grid>
    </Container>
  )
}

export default makeApp(Home, rootReducer)
