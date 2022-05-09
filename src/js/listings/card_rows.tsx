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
    <div className="card-row">
      <div className={`row-fluid ${cards.length > 4 ? "scrollable" : ""}`}>
        {cards.map((prop: ListingProps) => (
          <div className="col-lg-3" key={prop.id}>
            <Card {...prop} handleClick={handleClick} itemId={prop.id} />
          </div>
        ))}
      </div>
      <br />
    </div>
  )
}
