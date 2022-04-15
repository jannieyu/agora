import * as React from "react"
import { Row, Col } from "react-bootstrap"
import { Button, Transition } from "semantic-ui-react"
import { useCallback, useSelector, useState } from "../base/react_base"
import { AppState } from "../base/reducers"
import isValidPrice from "./util"
import { ListingProps } from "./types"

export default function Listing(props: ListingProps) {
  const { category, name, price, condition, image, description, seller } = props
  const activeUser = useSelector((state: AppState) => state.user)

  const isBiddable = !!activeUser?.id && activeUser?.id !== seller?.id

  const [showBidOptions, setShowBidOptions] = useState<boolean>(false)

  const toggleShowBid = useCallback(() => {
    setShowBidOptions(!showBidOptions)
  }, [showBidOptions, setShowBidOptions])

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
              <tbody>
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
                <tr>
                  <td className="name-cell">
                    <b>Sold By</b>
                  </td>
                  <td>{`${seller?.firstName} ${seller?.lastName}`}</td>
                </tr>
              </tbody>
            </table>
            <br />
            {isBiddable ? (
              <Button primary onClick={toggleShowBid}>
                Place Bid
              </Button>
            ) : null}
            <br />
            <Transition.Group animation="zoom" duration={200}>
              {showBidOptions && (
                <div>
                  <br />
                  <div>Please enter bid amount</div>
                </div>
              )}
            </Transition.Group>
          </div>
        </div>
      </Col>
    </Row>
  )
}
