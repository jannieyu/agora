import * as React from "react"
import { Row, Col, Form } from "react-bootstrap"
import DateTimePicker from "react-datetime-picker"
import { Button } from "semantic-ui-react"
import { useCallback, useState } from "./react_base"
import { apiCall as createAuction } from "../api/create_auction"

const hour = 1000 * 60 * 60
const day = hour * 24
const week = day * 7

const toISO = (d: Date) => {
  const simplifiedISO = d.toISOString()
  const noMS = simplifiedISO.substring(0, simplifiedISO.length - 5)
  return `${noMS}-0000`
}

function StartAuction() {
  const now = new Date()

  const [startDate, onChangeStartDate] = useState(new Date(now.getTime() + hour))
  const [endDate, onChangeEndDate] = useState(new Date(now.getTime() + week))
  const [submitting, setSubmitting] = useState<boolean>(false)

  const handleSubmit = useCallback(() => {
    setSubmitting(true)
    createAuction(
      {
        startTime: toISO(startDate),
        endTime: toISO(endDate),
      },
      () => {
        setSubmitting(false)
      },
      () => {
        setSubmitting(false)
      },
    )
  }, [startDate, endDate])

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col xs={12} align="center">
          <h1>Create an Auction</h1>
        </Col>
      </Row>
      <br />
      <Row>
        <Col xs={12} align="center">
          <strong>Enter Start Date / Time</strong>
          <br />
          <DateTimePicker onChange={onChangeStartDate} value={startDate} />
        </Col>
      </Row>
      <br />
      <br />
      <Row>
        <Col xs={12} align="center">
          <strong>Enter End Date / Time</strong>
          <br />
          <DateTimePicker onChange={onChangeEndDate} value={endDate} />
        </Col>
      </Row>
      <br />
      <br />
      <Row>
        <Col xs={12} align="center">
          <Button positive loading={submitting}>
            Create Auction
          </Button>
        </Col>
      </Row>
    </Form>
  )
}

export default StartAuction
