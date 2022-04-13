import * as React from "react"
import { Row, Col } from "react-bootstrap"
import isValidPrice from "./util"
import { ListingProps } from "./types"

export default function Listing(props: ListingProps) {
  const { category, name, price, condition, image, description } = props

  return (
    <Row>
      <Col xs="12">
        <div className="listing">
          {category ? <b className="category">{category}</b> : null}
          <div>
            {image ? <img src={image} alt="Listing Preview" className="listing-image" /> : null}
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
