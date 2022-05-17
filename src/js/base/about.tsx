import * as React from "react"
import { Row, Col } from "react-bootstrap"

function About() {
  return (
    <Row>
      <Col xs="6">
        <h1>About AuctionHouse</h1>
        <p>
          AuctionHouse is a hyperlocal auction platform. Users can create auctions that run for a
          preset amount of time and invite members of their community to participate. For example, a
          university can create an AuctionHouse auction in the spring in which graduating students
          list items to sell to underclassmen. AuctionHouse is a trust based platform: we do not
          collect credit card information and <i>cannot enforce </i> enforce that a transaction is
          completed after the auction ends. Make sure to only invite trusted community members to
          AuctionHouse auctions!
        </p>
      </Col>
    </Row>
  )
}

export default About
