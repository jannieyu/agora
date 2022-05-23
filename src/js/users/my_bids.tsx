import * as React from "react"
import { useSearchParams } from "react-router-dom"
import { Tab } from "semantic-ui-react"
import ListingModal from "../listings/listing_modal"
import { AppState, SearchItem } from "../base/reducers"
import { useCallback, useEffect, useMemo, useSelector, useState } from "../base/react_base"
import { safeParseFloat, safeParseInt } from "../base/util"
import { apiCall as getBids, Response as GetBidsResponse, ItemBid } from "../api/get_bids"
import { apiCall as getBidBots, Response as GetBidBotsResponse, BidBot } from "../api/get_bid_bots"
import { apiCall as getItem, Response as GetItemResponse } from "../api/get_item"
import { AuctionState } from "../base/types"

type AutomaticBidProps = BidBot & {
  setSearchParams: (arg: unknown) => void
  auctionState: AuctionState
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
    auctionState,
  } = props

  const highestItemBidStr = `$${safeParseFloat(highestItemBid).toFixed(2)}`
  const highestUserBidStr = `$${safeParseFloat(highestBotBid).toFixed(2)}`
  const maxBidStr = `$${safeParseFloat(maxBid).toFixed(2)}`

  const onClick = useCallback(() => {
    setSearchParams({ id: itemId })
  }, [setSearchParams, itemId])

  const delistedText = auctionState === AuctionState.COMPLETE ? "Auction Closed" : "Item Delisted"

  return (
    <div
      className={`my_bids ${
        activeItem || auctionState === AuctionState.COMPLETE ? "active-item" : "delisted"
      }`}
      onClick={onClick}
      onKeyDown={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="width-2">
        <div className="image-container">
          <img src={`/${itemImage}`} className="my-bids-image" alt="Listing Preview" />
        </div>
      </div>
      <div className="width-2">
        <b>{itemName}</b>
      </div>
      <div className="width-2">
        <div>Your Top Bid:</div>
        <strong>{highestUserBidStr}</strong>
      </div>
      <div className="width-2">
        <div>Top Overall Bid:</div>
        <strong>{highestItemBidStr}</strong>
      </div>
      <div className="width-2">
        <div>Bot Upper Limit:</div>
        <strong>{maxBidStr}</strong>
      </div>
      <div className="width-2">
        <div>Status</div>
        {active && activeItem ? (
          <strong className="winning">Active</strong>
        ) : (
          <strong className="losing">{activeItem ? "Deactivated" : delistedText}</strong>
        )}
      </div>
    </div>
  )
}

type ManualBidProps = ItemBid & {
  setSearchParams: (arg: unknown) => void
  auctionState: AuctionState
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
    auctionState,
  } = props
  const highestItemBidStr = `$${safeParseFloat(highestItemBid).toFixed(2)}`
  const highestUserBidStr = `$${safeParseFloat(highestUserBid).toFixed(2)}`

  const winning = safeParseFloat(highestUserBid) === safeParseFloat(highestItemBid)

  const onClick = useCallback(() => {
    setSearchParams({ id: itemId })
  }, [setSearchParams, itemId])

  const delistedText = auctionState === AuctionState.COMPLETE ? "Auction Closed" : "Item Delisted"

  return (
    <div
      className={`my-bids ${
        activeItem || auctionState === AuctionState.COMPLETE ? "active-item" : "delisted"
      }`}
      onClick={onClick}
      onKeyDown={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="width-3 text-centered">
        <div className="image-container">
          <img src={`/${itemImage}`} className="my-bids-image" alt="Listing Preview" />
        </div>
      </div>
      <div className="width-3">
        <b>{itemName}</b>
      </div>
      <div className="width-2">
        <div>Your Top Bid:</div>
        <strong>{highestUserBidStr}</strong>
      </div>
      <div className="width-2">
        <div>Top Overall Bid:</div>
        <strong>{highestItemBidStr}</strong>
      </div>
      <div className="width-2">
        <div>Status</div>
        {winning && activeItem ? (
          <strong className="winning">Winning</strong>
        ) : (
          <strong className="losing">{activeItem ? "Losing" : delistedText}</strong>
        )}
      </div>
    </div>
  )
}

export default function MyBids() {
  const [bids, setBids] = useState<ItemBid[]>([])
  const [bidBots, setBidBots] = useState<BidBot[]>([])
  const [selectedItem, setSelectedItem] = useState<SearchItem | null>(null)
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const auctionState = useSelector((state: AppState) => state.auction?.state)

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
    <ManualBid
      key={bid.itemId}
      {...bid}
      setSearchParams={setSearchParams}
      auctionState={auctionState}
    />
  ))

  const autoBids = bidBots.map((bidBot: BidBot) => (
    <AutomaticBid
      key={bidBot.id}
      {...bidBot}
      setSearchParams={setSearchParams}
      auctionState={auctionState}
    />
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
      <ListingModal
        show={!!selectedItem}
        onHide={deselectItem}
        selectedItem={selectedItem}
        redirectHome
      />
      <div className="my-bids-outer">
        <div className="my-bids-inner">
          <h1 className="text-centered">My Bids</h1>
          <br />
          <Tab panes={panes} activeIndex={activeIndex} onTabChange={handleTabChange} />
        </div>
      </div>
    </>
  )
}
