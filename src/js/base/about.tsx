import * as React from "react"
import { useTranslation } from "./react_base"
import { Row, Col } from "./ui/layout"

function About() {
  const { t } = useTranslation()

  const summary = `This site strives to be on the cutting edge of frontend technology,
    utilizing the latest and greatest from React, Redux, Babel, Webpack, Semantic UI, and Bootstrap.
    You can view the source code at `

  return (
    <Row>
      <Col xs="6">
        <h1>{t("About this site")}</h1>
        <p>
          {t(summary)}
          <a target="_blank" rel="noreferrer" href="https://github.com/RyanClark2k/web">
            https://github.com/RyanClark2k/web
          </a>
        </p>
      </Col>
    </Row>
  )
}

export default About
