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
            <table className="listing-metadata-table">
              {price && isValidPrice(price) ? (
                <tr>
                  <td className="name-cell">
                    <b>Price</b>
                  </td>
                  <td>{`$${price.replace("$", "")}`}</td>
                </tr>
              ) : null}
              {condition ? (
                <tr>
                  <td className="name-cell">
                    <b>Condition</b>
                  </td>
                  <td>{condition}</td>
                </tr>
              ) : null}
              {description ? (
                <tr>
                  <td className="name-cell">
                    <b>Description</b>
                  </td>
                  <td>{description}</td>
                </tr>
              ) : null}
            </table>
          </div>
        </div>
      </Col>
    </Row>
  )
}
