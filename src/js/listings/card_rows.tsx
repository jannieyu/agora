import * as React from "react"
import Card from "./card"
import { ActionType, ListingProps } from "./types"

interface CardRowProps {
  cards: ListingProps[]
  handleClick: (id: number, type: ActionType) => void
}

export default function CardRow(props: CardRowProps) {
  const { cards, handleClick } = props

  return (
    <div className="card-row-outer">
      <div className="card-row-inner">
        {cards.map((prop: ListingProps) => (
          <div key={prop.id} className="card-container">
            <Card {...prop} handleClick={handleClick} itemId={prop.id} />
          </div>
        ))}
      </div>
      <br />
    </div>
  )
}
