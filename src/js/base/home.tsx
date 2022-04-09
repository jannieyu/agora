import * as React from "react"
import { Row, Col } from "react-bootstrap"
import { Dropdown, Input } from "semantic-ui-react"
import { categories } from "../listing/constants"

const options = [
  {
    key: "all",
    value: "all",
    text: "All Categories",
  },
  ...categories,
]

function Home() {
  return (
    <Row>
      <Col xs={3} />
      <Col xs={6} align="center">
        <Input
          action={<Dropdown button basic floating options={options} defaultValue="all" />}
          actionPosition="left"
          icon="search"
          size="large"
          placeholder="Search..."
          fluid
        />
      </Col>
      <Col xs={3} />
    </Row>
  )
}

export default Home
