import * as React from "react"
import { Button } from "./ui/inputs"
import { Grid } from "./ui/layout"
import { useCallback, useDispatch, useSelector, useTranslation, makeApp } from "./react_base"
import { rootReducer, AppState } from "./reducers"
import setData from "./actions"

const Home = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const numClicks = useSelector((state: AppState) => state.numClicks)

  const onToggle = useCallback(() => {
    dispatch(
      setData({
        numClicks: numClicks + 1,
      }),
    )
  }, [numClicks, dispatch])

  const headerPrefix = t("The button has been clicked")
  const headerSuffix = t("times")

  return (
    <Grid container>
      <Grid item xs={12}>
        <h1 className="title">{`${headerPrefix} ${numClicks} ${headerSuffix}`}</h1>
      </Grid>
      <Grid item xs={6}>
        <Button onClick={onToggle} variant="contained">
          {t("Toggle")}
        </Button>
      </Grid>
    </Grid>
  )
}

export default makeApp(Home, rootReducer)
