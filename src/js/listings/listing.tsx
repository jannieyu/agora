import * as React from "react"
import { Accordion, Button, Message, Icon, Transition } from "semantic-ui-react"
import { DateTime } from "luxon"
import { Link } from "react-router-dom"
import { useCallback, useDispatch, useSelector, useState } from "../base/react_base"
import { AppState, BidHistory as BidHistoryT } from "../base/reducers"
import { setData } from "../base/actions"
import { safeParseFloat } from "../base/util"
import { isValidPrice } from "./util"
import { ListingProps } from "./types"
import BidForm from "./bid_form"
import RecommendedItems from "./recommended_items"
import { AuctionState } from "../base/types"

function HistoricalBidDatum(bid: BidHistoryT) {
  const { createdAt, bidPrice } = bid

  const dt = DateTime.fromISO(createdAt)
  const day = dt.toLocaleString({ month: "long", day: "numeric" })
  const hour = dt.toLocaleString(DateTime.TIME_SIMPLE)

  return (
    <tr>
      <td>{safeParseFloat(bidPrice).toFixed(2)}</td>
      <td>{day}</td>
      <td>{hour}</td>
    </tr>
  )
}

function BidHistory(props: ListingProps) {
  const { bids, price, createdAt, defaultShowHistory } = props

  const [active, setActive] = useState<boolean>(defaultShowHistory)
  const handleClick = useCallback(() => {
    setActive(!active)
  }, [active])

  const dt = DateTime.fromISO(createdAt)
  const day = dt.toLocaleString({ month: "long", day: "numeric" })
  const hour = dt.toLocaleString(DateTime.TIME_SIMPLE)

  const reversedBids = bids?.slice()?.reverse()

  return (
    <Accordion>
      <Accordion.Title active={active} index={0} onClick={handleClick}>
        <Icon name="dropdown" />
        <b>Bid History</b>
      </Accordion.Title>
      <Accordion.Content active={active}>
        <table className="listing-history-table">
          <thead>
            <tr>
              <th>Bid Price</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {reversedBids?.map((bid: BidHistoryT) => (
              <HistoricalBidDatum {...bid} key={bid.createdAt} />
            ))}
            <tr>
              <td>{price ? `${safeParseFloat(price)?.toFixed(2)}` : ""}</td>
              <td>{day}</td>
              <td>{hour}</td>
            </tr>
          </tbody>
        </table>
      </Accordion.Content>
    </Accordion>
  )
}

export default function Listing(props: ListingProps) {
  const {
    category,
    name,
    highestBid,
    condition,
    image,
    description,
    seller,
    id,
    numBids,
    isLocal,
    active,
    showRecommendations,
    isPreview,
    redirectHome,
  } = props
  const { activeUser, auctionState } = useSelector((state: AppState) => ({
    activeUser: state.user,
    auctionState: state.auction.state,
  }))

  const dispatch = useDispatch()

  const [showBidOptions, setShowBidOptions] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string>("")

  const isBiddable = !!activeUser?.id && activeUser?.id !== seller?.id && !successMessage && active

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

  const imageSrc = isLocal ? image : `/${image}`

  /* &&id trick prevents modal from showing (delisted) upon closure */

  return id || isPreview ? (
    <div className="listing">
      {category ? <b className="category">{category}</b> : null}
      <div className="grid">
        <div className="text-centered">
          {image ? <img src={imageSrc} alt="Listing Preview" className="listing-image" /> : null}
        </div>
        <div className="listing-information">
          <h2>
            <span>{name}</span>
            {!active && (
              <span className="red">
                &nbsp;(
                {auctionState === AuctionState.COMPLETE ? "Auction Closed" : "delisted"})
              </span>
            )}
          </h2>
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
          <BidHistory {...props} defaultShowHistory={!isBiddable && !!activeUser} />
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
      {showRecommendations && (
        <RecommendedItems category={category} itemId={id} redirectHome={redirectHome} />
      )}
    </div>
  ) : (
    <div />
  )
}
