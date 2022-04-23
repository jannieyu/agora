import * as React from "react"
import { Row, Col } from "react-bootstrap"

function About() {
  return (
    <Row>
      <Col xs="6">
        <h1>About Agora</h1>
        <p>
          Agora is a hyperlocal auction platform. Users can create auctions that run for a preset
          amount of time and invite members of their community to participate. For example, a
          university can create an Agora auction in the spring in which graduating students list
          items to sell to underclassmen. Agora is a trust based platform: we do not collect credit
          card information and <i>cannot enforce </i> enforce that a transaction is completed after
          the auction ends. Make sure to only invite trusted community members to Agora auctions!
        </p>
      </Col>
    </Row>
  )
}

export default About
