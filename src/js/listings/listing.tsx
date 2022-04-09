import * as React from "react"
import { Row, Col } from "react-bootstrap"

export interface ListingProps {
  category: string
  name: string
  price: string
  condition: string
  image: string
  description: string
  id: number
}

export function isValidPrice(input: string) {
  const pattern = /(?=.*?\d)^\$?(([1-9]\d{0,2}(,\d{3})*)|\d+)?(\.\d{1,2})?$/
  return pattern.test(input)
}

export default function Listing(props: ListingProps) {
  const { category, name, price, condition, image, description } = props

  return (
    <Row>
      <Col xs="12">
        <div className="listing">
          {category ? <b className="category">{category}</b> : null}
          <div>
            {image ? <img src={image} alt="Listing Preview" className="image-preview" /> : null}
          </div>
          <div>
            <h2>{name}</h2>
            <div className="major-metadata">
              {price && isValidPrice(price) ? (
                <>
                  <b>Price:</b> <span>{price.startsWith("$") ? price : `$${price}`}</span>
                </>
              ) : null}
            </div>
            <div className="major-metadata">
              {condition ? (
                <>
                  <b>Condition:</b> <span>{condition}</span>
                </>
              ) : null}
            </div>
            <br />
            <div>
              {description ? (
                <>
                  <b className="major-metadata">Description:</b> <span>{description}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </Col>
    </Row>
  )
}
