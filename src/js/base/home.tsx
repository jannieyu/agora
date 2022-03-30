import * as React from "react"
import { Button } from "./ui/inputs"
import { Row, Col } from "./ui/layout"
import { useCallback, useDispatch, useSelector, useTranslation, makeApp } from "./react_base"
import { rootReducer, AppState } from "./reducers"
import setData from "./actions"
import { apiCall, API_ARGS } from "../api/example"

function Home() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const numClicks = useSelector((state: AppState) => state.numClicks)

  const onToggle = useCallback(() => {
    dispatch(
      setData({
        numClicks: numClicks + 1,
      }),
    )
    apiCall(
      API_ARGS,
      () => {},
      () => {},
    )
  }, [numClicks, dispatch])

  const headerPrefix = t("The button has been clicked")
  const headerSuffix = t("times")

  return (
    <Row>
      <Col xs={12}>
        <h1 className="title">{`${headerPrefix} ${numClicks} ${headerSuffix}`}</h1>
      </Col>
      <Col xs={6}>
        <Button onClick={onToggle} variant="contained">
          {t("Example API Trigger")}
        </Button>
      </Col>
    </Row>
  )
}

export default makeApp(Home, rootReducer)
