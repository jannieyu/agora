import * as React from "react"
import { Row, Col, OverlayTrigger, Popover } from "react-bootstrap"
import { Button, Form, Message, Transition } from "semantic-ui-react"
import { useCallback, useDispatch, useSelector, useState } from "../base/react_base"
import { AppState } from "../base/reducers"
import { setData, updateSearchItem } from "../base/actions"
import { safeParseFloat } from "../base/util"
import { isValidPrice, calculateIncrement } from "./util"
import { ListingProps } from "./types"
import DollarInput from "./dollar_input"
import { apiCall as addBidCall } from "../api/add_bid"

interface BidFormProps {
  priceStr: string
  itemId: number
}

function BidForm(props: BidFormProps) {
  const { priceStr, itemId } = props

  const [bidPrice, setBidPrice] = useState<string>("")
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  const price = safeParseFloat(priceStr)
  const minIncrement = calculateIncrement(price)

  const handleChangeBidAmount = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setBidPrice(e.currentTarget.value)
      setError("")
    },
    [setBidPrice],
  )

  const handleSubmit = useCallback(() => {
    setSubmitting(true)
    addBidCall(
      { itemId, bidPrice },
      () => {
        setSubmitting(false)
        updateSearchItem({ highestBid: safeParseFloat(bidPrice) }, itemId)
      },
      (err) => {
        setSubmitting(false)
        setError(err.body as string)
      },
    )
  }, [itemId, bidPrice])

  const minBid = price + minIncrement

  const canSubmit = isValidPrice(bidPrice) && safeParseFloat(bidPrice) >= minBid

  const submitBtn = (
    <Button type="submit" disabled={!canSubmit} loading={submitting} onClick={handleSubmit}>
      Submit Bid
    </Button>
  )

  const wrappedSubmitBtn = canSubmit ? (
    submitBtn
  ) : (
    <OverlayTrigger
      placement="right"
      trigger={["hover", "focus"]}
      overlay={
        <Popover>
          <Popover.Body>
            You must enter a valid price of at least {`$${minBid.toFixed(2)}`} to submit the bid.
          </Popover.Body>
        </Popover>
      }
    >
      <span>{submitBtn}</span>
    </OverlayTrigger>
  )

  return (
    <Form error={!!error}>
      <Form.Field
        control={DollarInput}
        label={`Enter bid of $${minBid.toFixed(2)} or more.`}
        placeholder={minBid.toFixed(2)}
        onChange={handleChangeBidAmount}
        error={!!bidPrice && !isValidPrice(bidPrice)}
        value={bidPrice}
      />
      <Message error header="Error" content={error} />
      {wrappedSubmitBtn}
    </Form>
  )
}

export default function Listing(props: ListingProps) {
  const { category, name, highestBid, condition, image, description, seller, id } = props
  const activeUser = useSelector((state: AppState) => state.user)

  const dispatch = useDispatch()

  const isBiddable = !!activeUser?.id && activeUser?.id !== seller?.id

  const [showBidOptions, setShowBidOptions] = useState<boolean>(false)

  const toggleShowBid = useCallback(() => {
    setShowBidOptions(!showBidOptions)
  }, [showBidOptions, setShowBidOptions])

  const onLogin = useCallback(() => {
    dispatch(setData({ showLoginModal: true }))

    dispatch(setData({ isSignUp: false }))
  }, [dispatch])

  const onSignUp = useCallback(() => {
    dispatch(setData({ showLoginModal: true }))

    dispatch(setData({ isSignUp: true }))
  }, [dispatch])

  return (
    <Row>
      <Col xs="12">
        <div className="listing">
          {category ? <b className="category">{category}</b> : null}
          <div>
            {image ? <img src={image} alt="Listing Preview" className="listing-image" /> : null}
          </div>
          <div className="listing-information">
            <h2>{name}</h2>
            <table className="listing-metadata-table">
              <tbody>
                {highestBid && isValidPrice(highestBid) ? (
                  <tr>
                    <td className="name-cell">
                      <b>Price</b>
                    </td>
                    <td>{`$${safeParseFloat(highestBid)?.toFixed(2)}`}</td>
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
                <tr>
                  <td className="name-cell">
                    <b>Sold By</b>
                  </td>
                  <td>{`${seller?.firstName} ${seller?.lastName}`}</td>
                </tr>
                {description ? (
                  <tr>
                    <td className="name-cell">
                      <b>Description</b>
                    </td>
                    <td>{description}</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
            {isBiddable ? (
              <Button primary onClick={toggleShowBid} className="bid-button">
                {showBidOptions ? "Cancel" : "Place Bid"}
              </Button>
            ) : null}
            {!isBiddable && !activeUser ? (
              <Message>
                <Button onClick={onLogin} color="green">
                  Log in
                </Button>{" "}
                or{" "}
                <Button onClick={onSignUp} color="orange">
                  Sign Up
                </Button>{" "}
                to bid on this item.
              </Message>
            ) : null}
            <br />
            <Transition.Group animation="zoom" duration={200}>
              {showBidOptions && (
                <div>
                  <br />
                  <BidForm priceStr={highestBid} itemId={id} />
                </div>
              )}
            </Transition.Group>
          </div>
        </div>
      </Col>
    </Row>
  )
}
