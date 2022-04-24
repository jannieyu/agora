/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from "react"
import { Row, Col, OverlayTrigger, Popover } from "react-bootstrap"
import { Accordion, Button, Checkbox, Form, Message, Icon, Transition } from "semantic-ui-react"
import { DateTime } from "luxon"
import { Link } from "react-router-dom"
import { useCallback, useDispatch, useSelector, useState } from "../base/react_base"
import { AppState } from "../base/reducers"
import { setData, updateSearchItem } from "../base/actions"
import { safeParseFloat } from "../base/util"
import { isValidPrice, calculateIncrement } from "./util"
import { ListingProps } from "./types"
import DollarInput from "./dollar_input"
import { apiCall as addBidCall } from "../api/add_bid"

function BidHistory(props: ListingProps) {
  const { price } = props

  const [active, setActive] = useState<boolean>(false)
  const handleClick = useCallback(() => {
    setActive(!active)
  }, [active])

  return (
    <Accordion>
      <Accordion.Title active={active} index={0} onClick={handleClick}>
        <Icon name="dropdown" />
        <b>Bid History</b>
      </Accordion.Title>
      <Accordion.Content active={active}>
        <ul>
          <li>{`The item was listed at XYZ on 123 with a starting price of $${price}.`}</li>
        </ul>
      </Accordion.Content>
    </Accordion>
  )
}

interface BidFormProps {
  priceStr: string
  numBids: number
  itemId: number
  handleSuccess: (message: string) => void
  bidderId: number
}

function BidForm(props: BidFormProps) {
  const { priceStr, numBids, itemId, handleSuccess, bidderId } = props

  const dispatch = useDispatch()

  const [bidPrice, setBidPrice] = useState<string>("")
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [showAutobidder, setShowAutobidder] = useState<boolean>(false)
  const [autoBidPrice, setAutoBidPrice] = useState<string>("")

  const price = safeParseFloat(priceStr)
  const minIncrement = calculateIncrement(price)

  const handleChangeBidAmount = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setBidPrice(e.currentTarget.value)
      setError("")
    },
    [setBidPrice],
  )

  const handleChangeAutoBidAmount = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setAutoBidPrice(e.currentTarget.value)
      setError("")
    },
    [setAutoBidPrice],
  )

  const toggleShowAutobidder = useCallback(() => {
    setShowAutobidder(!showAutobidder)
  }, [showAutobidder])

  const handleSubmit = useCallback(() => {
    setSubmitting(true)
    addBidCall(
      { itemId, bidPrice },
      () => {
        setSubmitting(false)

        const newBid = {
          bidderId,
          itemId,
          bidPrice,
          createdAt: DateTime.now().toISO(),
        }

        dispatch(updateSearchItem({ highestBid: bidPrice, numBids: numBids + 1 }, itemId, newBid))
        handleSuccess(`Bid of $${bidPrice} successfully created!`)
      },
      (err) => {
        setSubmitting(false)
        setError(err.body as string)
      },
    )
  }, [dispatch, itemId, bidPrice, numBids, handleSuccess, bidderId])

  const minBid = price + minIncrement
  const minAutoBid = minBid + minIncrement

  const isValidBid = isValidPrice(bidPrice) && safeParseFloat(bidPrice) >= minBid
  const isValidAutoBid =
    !showAutobidder || (isValidPrice(autoBidPrice) && safeParseFloat(autoBidPrice) >= minAutoBid)
  const canSubmit = isValidBid && isValidAutoBid

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
            {!isValidBid
              ? `You must enter a valid bid of at least $${minBid.toFixed(2)} to submit.`
              : `You must enter a valid autobidder target of at least $${minAutoBid.toFixed(2)}
                to submit the bid.`}
          </Popover.Body>
        </Popover>
      }
    >
      <span>{submitBtn}</span>
    </OverlayTrigger>
  )

  return (
    <Form error={!!error}>
      <Row>
        <Col xs="6">
          <div className="field">
            <label>{`Enter bid of $${minBid.toFixed(2)} or more.`}</label>
          </div>
        </Col>
      </Row>
      <Row className="align-items-center">
        <Col xs="6">
          <Form.Field
            control={DollarInput}
            placeholder={minBid.toFixed(2)}
            onChange={handleChangeBidAmount}
            error={!!bidPrice && !isValidPrice(bidPrice)}
            value={bidPrice}
          />
        </Col>
        <Col xs="6">
          <Checkbox slider label="Enable Autobidder?" onChange={toggleShowAutobidder} />
        </Col>
      </Row>
      <Row>
        <Col xs="12">
          <Transition.Group animation="zoom" duration={200}>
            {showAutobidder && (
              <div>
                <br />
                <Form.Field
                  control={DollarInput}
                  placeholder={(minBid * 2).toFixed(2)}
                  onChange={handleChangeAutoBidAmount}
                  error={!!autoBidPrice && !isValidPrice(autoBidPrice)}
                  value={autoBidPrice}
                  label="If the autobidder is enabled, Agora will automatically increase your bid by the minimum increment each time you are outbid, until you reach the maximum amount specified below."
                />
              </div>
            )}
          </Transition.Group>
        </Col>
      </Row>
      <Message error header="Error" content={error} />
      <br />
      {wrappedSubmitBtn}
    </Form>
  )
}

export default function Listing(props: ListingProps) {
  const { category, name, highestBid, condition, image, description, seller, id, numBids } = props
  const activeUser = useSelector((state: AppState) => state.user)

  const dispatch = useDispatch()

  const [showBidOptions, setShowBidOptions] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string>("")

  const isBiddable = !!activeUser?.id && activeUser?.id !== seller?.id && !successMessage

  const handleSuccess = useCallback((message: string) => {
    setShowBidOptions(false)
    setSuccessMessage(message)
  }, [])

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
                  <td>
                    <Link
                      to={`/user_profile/?id=${seller?.id}`}
                      target="_blank"
                    >{`${seller?.firstName} ${seller?.lastName}`}</Link>
                  </td>
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
            <BidHistory {...props} />
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
                  <BidForm
                    priceStr={highestBid}
                    itemId={id}
                    numBids={numBids}
                    handleSuccess={handleSuccess}
                    bidderId={activeUser?.id}
                  />
                </div>
              )}
              {!showBidOptions && !!successMessage && <Message success>{successMessage}</Message>}
            </Transition.Group>
          </div>
        </div>
      </Col>
    </Row>
  )
}
