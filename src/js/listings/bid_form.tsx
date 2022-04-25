/* eslint-disable react/no-unused-prop-types */
/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from "react"
import { Row, Col, OverlayTrigger, Popover } from "react-bootstrap"
import { Button, Tab, Form, Message } from "semantic-ui-react"
import { DateTime } from "luxon"
import { useCallback, useDispatch, useState } from "../base/react_base"
import { updateSearchItem } from "../base/actions"
import { safeParseFloat } from "../base/util"
import { isValidPrice, calculateIncrement } from "./util"
import DollarInput from "./dollar_input"
import { apiCall as addBidCall } from "../api/add_bid"
import { apiCall as addBidBotCall } from "../api/add_bid_bot"

interface RefinedBidFormProps {
  price: number
  minIncrement: number
  numBids: number
  itemId: number
  handleSuccess: (message: string) => void
  bidderId: number
}

function AutomaticBidForm(props: RefinedBidFormProps) {
  const { price, numBids, itemId, handleSuccess, bidderId, minIncrement } = props

  const dispatch = useDispatch()

  const [bidPrice, setBidPrice] = useState<string>("")
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  const handleChangeBidAmount = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setBidPrice(e.currentTarget.value)
      setError("")
    },
    [setBidPrice],
  )

  const handleSubmit = useCallback(() => {
    setSubmitting(true)
    addBidBotCall(
      { itemId, maxBid: bidPrice },
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
          `The autobidder was successfullly confirgured to bid up to $${bidPrice}! You will be notified
          if another user's bid exceeds this price or if the auction ends and you win the item.`,
        )
      },
      (err) => {
        setSubmitting(false)
        setError(err.body as string)
      },
    )
  }, [dispatch, itemId, bidPrice, numBids, handleSuccess, bidderId])

  const minBid = price + minIncrement

  const isValidBid = isValidPrice(bidPrice) && safeParseFloat(bidPrice) >= minBid

  const submitBtn = (
    <Button type="submit" disabled={!isValidBid} loading={submitting} onClick={handleSubmit}>
      Submit Bid
    </Button>
  )

  const wrappedSubmitBtn = isValidBid ? (
    submitBtn
  ) : (
    <OverlayTrigger
      placement="right"
      trigger={["hover", "focus"]}
      overlay={
        <Popover>
          <Popover.Body>
            {`You must enter a valid autobidder target of at least $${minBid.toFixed(2)}
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
        <Col xs="12">
          <div>
            <br />
            <Form.Field
              control={DollarInput}
              placeholder={minBid.toFixed(2)}
              onChange={handleChangeBidAmount}
              error={!!bidPrice && !isValidPrice(bidPrice)}
              value={bidPrice}
              label="Agora will automatically increase your bid by the minimum
              increment each time you are outbid, until you reach the maximum amount specified below."
            />
          </div>
        </Col>
      </Row>
      <Message error header="Error" content={error} />
      <br />
      {wrappedSubmitBtn}
    </Form>
  )
}

function ManualBidForm(props: RefinedBidFormProps) {
  const { price, minIncrement, numBids, itemId, handleSuccess, bidderId } = props

  const dispatch = useDispatch()

  const [bidPrice, setBidPrice] = useState<string>("")
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

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

  const isValidBid = isValidPrice(bidPrice) && safeParseFloat(bidPrice) >= minBid

  const submitBtn = (
    <Button type="submit" disabled={!isValidBid} loading={submitting} onClick={handleSubmit}>
      Submit Bid
    </Button>
  )

  const wrappedSubmitBtn = isValidBid ? (
    submitBtn
  ) : (
    <OverlayTrigger
      placement="right"
      trigger={["hover", "focus"]}
      overlay={
        <Popover>
          <Popover.Body>
            {`You must enter a valid bid of at least $${minBid.toFixed(2)} to submit.`}
          </Popover.Body>
        </Popover>
      }
    >
      <span>{submitBtn}</span>
    </OverlayTrigger>
  )

  return (
    <Form error={!!error}>
      <br />
      <Row>
        <Col xs="12">
          <div className="field">
            <label>{`Enter bid of $${minBid.toFixed(2)} or more.`}</label>
          </div>
        </Col>
      </Row>
      <Row className="align-items-center">
        <Col xs="12">
          <Form.Field
            control={DollarInput}
            placeholder={minBid.toFixed(2)}
            onChange={handleChangeBidAmount}
            error={!!bidPrice && !isValidPrice(bidPrice)}
            value={bidPrice}
          />
        </Col>
      </Row>
      <Message error header="Error" content={error} />
      <br />
      {wrappedSubmitBtn}
    </Form>
  )
}

interface BidFormProps {
  priceStr: string
  numBids: number
  itemId: number
  handleSuccess: (message: string) => void
  bidderId: number
}

export default function BidForm(props: BidFormProps) {
  const { priceStr } = props

  const price = safeParseFloat(priceStr)
  const minIncrement = calculateIncrement(price)

  const panes = [
    {
      menuItem: "Manual Bid",
      render: () => <ManualBidForm price={price} minIncrement={minIncrement} {...props} />,
    },
    {
      menuItem: "Automatic Bid",
      render: () => <AutomaticBidForm price={price} minIncrement={minIncrement} {...props} />,
    },
  ]

  return <Tab panes={panes} />
}
