import * as React from "react"
import { Row, Col } from "react-bootstrap"
import Card from "./card"
import { ActionType, ListingProps } from "./types"

interface CardRowProps {
  cards: ListingProps[]
  handleClick: (id: number, type: ActionType) => void
}

export default function CardRow(props: CardRowProps) {
  const { cards, handleClick } = props

  return (
    <>
      <Row>
        {cards.map((prop: ListingProps) => (
          <Col xs={3} key={prop.id}>
            <Card {...prop} handleClick={handleClick} itemId={prop.id} />
          </Col>
        ))}
      </Row>
      <br />
    </>
  )
}
