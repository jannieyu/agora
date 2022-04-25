/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from "react"
import { Row, Col, OverlayTrigger, Popover } from "react-bootstrap"
import { Button, Checkbox, Form, Message, Transition } from "semantic-ui-react"
import { DateTime } from "luxon"
import { useCallback, useDispatch, useState } from "../base/react_base"
import { updateSearchItem } from "../base/actions"
import { safeParseFloat } from "../base/util"
import { isValidPrice, calculateIncrement } from "./util"
import DollarInput from "./dollar_input"
import { apiCall as addBidCall } from "../api/add_bid"

interface BidFormProps {
  priceStr: string
  numBids: number
  itemId: number
  handleSuccess: (message: string) => void
  bidderId: number
}

export default function BidForm(props: BidFormProps) {
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
        handleSuccess(
          `Bid of $${bidPrice} successfully created! You will be notified if you are outbid or
          if the auction ends and you win the item.`,
        )
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
