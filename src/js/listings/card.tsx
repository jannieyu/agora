import * as React from "react"
import { ListingProps } from "./listing"

export default function Card(props: ListingProps) {
  const { category, name, price, condition, image } = props

  return (
    <div className="card">
      <h2>{name}</h2>
      <div>
        <img src={image} alt="Listing Preview" className="card-image" />
      </div>
      <div>
        <div className="major-metadata">
          <span>
            <b>{price.startsWith("$") ? price : `$${price}`}</b>
          </span>
        </div>
        <div>{category}</div>
        <div>{condition}</div>
      </div>
    </div>
  )
}
