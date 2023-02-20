/* eslint-disable react/no-unused-prop-types */
/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from "react"
import { OverlayTrigger, Popover } from "react-bootstrap"
import { Button, Tab, Form, Message } from "semantic-ui-react"
import { useCallback, useSelector, useState } from "../base/react_base"
import { safeParseFloat } from "../base/util"
import { isValidPrice, calculateIncrement } from "./util"
import DollarInput from "./dollar_input"
import * as API from "../generated/openapi"
import { apiCall as addBidBotCall } from "../api/add_bid_bot"
import { AppState } from "../base/reducers"

export interface RefinedBidFormProps {
  price: number
  minIncrement: number
  numBids: number
  itemId: number
  handleSuccess: (message: string) => void
  bidderId: number
}

export function AutomaticBidForm(props: RefinedBidFormProps) {
  const { price, itemId, handleSuccess, minIncrement } = props

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

  const minBid = price + minIncrement

  const handleSubmit = useCallback(() => {
    setSubmitting(true)
    addBidBotCall(
      { itemId, maxBid: bidPrice },
      () => {
        setSubmitting(false)
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
  }, [itemId, bidPrice, handleSuccess])

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
      <div>
        <br />
        <Form.Field
          control={DollarInput}
          placeholder={minBid.toFixed(2)}
          onChange={handleChangeBidAmount}
          error={!!bidPrice && !isValidPrice(bidPrice)}
          value={bidPrice}
          label="AuctionHouse will automatically increase your bid by the minimum
              increment each time you are outbid, until you reach the maximum amount specified below."
        />
      </div>
      <Message error header="Error" content={error} />
      <br />
      {wrappedSubmitBtn}
    </Form>
  )
}

export function ManualBidForm(props: RefinedBidFormProps) {
  const { apiInstance } = useSelector((state: AppState) => state)
  const { price, minIncrement, itemId, handleSuccess } = props

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
    const body: API.AddBidRequest = { itemId, bidPrice }

    apiInstance
      .addBid(body)
      .then(() => {
        setSubmitting(false)

        handleSuccess(
          `Bid of $${safeParseFloat(bidPrice).toFixed(
            2,
          )} successfully created! You will be notified if you are outbid or
          if the auction ends and you win the item.`,
        )
      })
      .catch((err: any) => {
        setSubmitting(false)
        setError(err.body as string)
      })
  }, [apiInstance, itemId, bidPrice, handleSuccess])

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
      <div className="field">
        <label>{`Enter bid of $${minBid.toFixed(2)} or more.`}</label>
      </div>
      <div>
        <Form.Field
          control={DollarInput}
          placeholder={minBid.toFixed(2)}
          onChange={handleChangeBidAmount}
          error={!!bidPrice && !isValidPrice(bidPrice)}
          value={bidPrice}
        />
      </div>
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
  defaultAutomatic?: boolean
}

export default function BidForm(props: BidFormProps) {
  const { priceStr, defaultAutomatic } = props

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

  return <Tab panes={panes} defaultActiveIndex={defaultAutomatic ? 1 : 0} />
}

BidForm.defaultProps = {
  defaultAutomatic: false,
}
