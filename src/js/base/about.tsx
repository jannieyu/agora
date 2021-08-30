import * as React from "react"
import { useTranslation } from "./react_base"
import { Row, Col } from "./ui/layout"

const About = () => {
  const { t } = useTranslation()

  const summary = `This site strives to be on the cutting edge of frontend technology,
    utilizing the latest and greatest from React, Redux, Babel, Webpack, Material UI, and Bootstrap.`

  return (
    <Row>
      <Col xs="6">
        <h1>{t("About this site")}</h1>
        <p>{t(summary)}</p>
      </Col>
    </Row>
  )
}

export default About
