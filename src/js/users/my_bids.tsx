import * as React from "react"
import { useSearchParams } from "react-router-dom"
import { Row, Col } from "react-bootstrap"
import { Tab } from "semantic-ui-react"
import ListingModal from "../listings/listing_modal"
import { SearchItem } from "../base/reducers"
import { useCallback, useEffect, useMemo, useState } from "../base/react_base"
import { safeParseFloat, safeParseInt } from "../base/util"
import { apiCall as getBids, Response as GetBidsResponse, ItemBid } from "../api/get_bids"
import { apiCall as getBidBots, Response as GetBidBotsResponse, BidBot } from "../api/get_bid_bots"
import { apiCall as getItem, Response as GetItemResponse } from "../api/get_item"

type AutomaticBidProps = BidBot & {
  setSearchParams: (arg: unknown) => void
}

function AutomaticBid(props: AutomaticBidProps) {
  const {
    highestItemBid,
    highestBotBid,
    itemId,
    itemName,
    itemImage,
    maxBid,
    active,
    activeItem,
    setSearchParams,
  } = props

  const highestItemBidStr = `$${safeParseFloat(highestItemBid).toFixed(2)}`
  const highestUserBidStr = `$${safeParseFloat(highestBotBid).toFixed(2)}`
  const maxBidStr = `$${safeParseFloat(maxBid).toFixed(2)}`

  const onClick = useCallback(() => {
    setSearchParams({ id: itemId })
  }, [setSearchParams, itemId])

  return (
    <Row
      onClick={onClick}
      onKeyDown={onClick}
      role="button"
      tabIndex={0}
      className={`my_bids align-items-center ${activeItem ? "active" : "delisted"}`}
    >
      <Col xs={2}>
        <img src={`/${itemImage}`} alt="Listing Preview" />
      </Col>
      <Col xs={2}>
        <b>{itemName}</b>
      </Col>
      <Col xs={2}>
        <div>Your Top Bid:</div>
        <strong>{highestUserBidStr}</strong>
      </Col>
      <Col xs={2}>
        <div>Top Overall Bid:</div>
        <strong>{highestItemBidStr}</strong>
      </Col>
      <Col xs={2}>
        <div>Bot Upper Limit:</div>
        <strong>{maxBidStr}</strong>
      </Col>
      <Col xs={2}>
        <div>Status</div>
        {active && activeItem ? (
          <strong className="winning">Active</strong>
        ) : (
          <strong className="losing">{activeItem ? "Deactivated" : "Item Delisted"}</strong>
        )}
      </Col>
    </Row>
  )
}

type ManualBidProps = ItemBid & {
  setSearchParams: (arg: unknown) => void
}

function ManualBid(props: ManualBidProps) {
  const {
    highestItemBid,
    highestUserBid,
    itemId,
    itemName,
    itemImage,
    activeItem,
    setSearchParams,
  } = props
  const highestItemBidStr = `$${safeParseFloat(highestItemBid).toFixed(2)}`
  const highestUserBidStr = `$${safeParseFloat(highestUserBid).toFixed(2)}`

  const winning = safeParseFloat(highestUserBid) === safeParseFloat(highestItemBid)

  const onClick = useCallback(() => {
    setSearchParams({ id: itemId })
  }, [setSearchParams, itemId])

  return (
    <Row
      className={`my_bids align-items-center ${activeItem ? "active" : "delisted"}`}
      onClick={onClick}
    >
      <Col xs={3} align="center">
        <img src={`/${itemImage}`} alt="Listing Preview" />
      </Col>
      <Col xs={3}>
        <b>{itemName}</b>
      </Col>
      <Col xs={2}>
        <div>Your Top Bid:</div>
        <strong>{highestUserBidStr}</strong>
      </Col>
      <Col xs={2}>
        <div>Top Overall Bid:</div>
        <strong>{highestItemBidStr}</strong>
      </Col>
      <Col xs={2}>
        <div>Status</div>
        {winning && activeItem ? (
          <strong className="winning">Winning</strong>
        ) : (
          <strong className="losing">{activeItem ? "Losing" : "Item Delisted"}</strong>
        )}
      </Col>
    </Row>
  )
}

export default function MyBids() {
  const [bids, setBids] = useState<ItemBid[]>([])
  const [bidBots, setBidBots] = useState<BidBot[]>([])
  const [selectedItem, setSelectedItem] = useState<SearchItem | null>(null)
  const [activeIndex, setActiveIndex] = useState<number>(0)

  const [searchParams, setSearchParams] = useSearchParams()
  const params = useMemo(() => Object.fromEntries([...searchParams]), [searchParams])

  const deselectItem = useCallback(() => {
    setSearchParams({})
  }, [setSearchParams])

  useEffect(() => {
    getBids(
      {},
      (bidsResponse: GetBidsResponse) => {
        setBids(bidsResponse)
      },
      () => {},
    )
    getBidBots(
      {},
      (bidBotsResponse: GetBidBotsResponse) => {
        const sortedBots = [
          ...bidBotsResponse.filter((bot) => bot.activeItem),
          ...bidBotsResponse.filter((bot) => !bot.activeItem),
        ]

        setBidBots(sortedBots)
      },
      () => {},
    )
  }, [])

  useEffect(() => {
    if (params.id) {
      const itemId = safeParseInt(params.id)
      const isFirstTab = bids.some((bid) => bid.itemId === itemId)

      if (isFirstTab) {
        setActiveIndex(0)
      } else {
        setActiveIndex(1)
      }

      getItem(
        { itemId },
        (response: GetItemResponse) => {
          setSelectedItem(response[0])
        },
        () => {},
      )
    } else {
      setSelectedItem(null)
    }
  }, [params, bids])

  const manualBids = bids.map((bid: ItemBid) => (
    <ManualBid key={bid.itemId} {...bid} setSearchParams={setSearchParams} />
  ))

  const autoBids = bidBots.map((bidBot: BidBot) => (
    <AutomaticBid key={bidBot.id} {...bidBot} setSearchParams={setSearchParams} />
  ))

  const handleTabChange = (e: React.FormEvent, { aI }) => setActiveIndex(aI)

  const panes = [
    {
      menuItem: "Manual Bids",
      render: () => (
        <div>
          {manualBids.length ? (
            manualBids
          ) : (
            <div>
              <br />
              You have not created any manual bids yet.
            </div>
          )}
        </div>
      ),
    },
    {
      menuItem: "Automatic Bids",
      render: () => (
        <div>{autoBids.length ? autoBids : "You have not created any automatic bids yet."}</div>
      ),
    },
  ]

  return (
    <>
      <ListingModal show={!!selectedItem} onHide={deselectItem} selectedItem={selectedItem} />
      <Row>
        <h1 className="text-centered">My Bids</h1>
        <Col xs={2} />
        <Col xs={8} align="center">
          <br />
          <Tab panes={panes} activeIndex={activeIndex} onTabChange={handleTabChange} />
        </Col>
        <Col xs={2} />
      </Row>
    </>
  )
}
