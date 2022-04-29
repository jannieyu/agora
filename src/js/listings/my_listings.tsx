import * as React from "react"
import { Row, Col } from "react-bootstrap"
import { Icon } from "semantic-ui-react"
import { useNavigate } from "react-router"
import { Link, useSearchParams } from "react-router-dom"
import { useCallback, useEffect, useMemo, useSelector, useState } from "../base/react_base"
import { apiCall as getSearchItems, Response as SearchItemResponse } from "../api/get_search_items"
import { AppState, SearchItem } from "../base/reducers"
import ListingModal from "./listing_modal"
import ConfirmationModal from "../base/confirmation_modal"
import { ListingProps } from "./types"
import { safeParseFloat } from "../base/util"

type LineItemProps = ListingProps & {
  setSearchParams: (arg: unknown) => void
  setDeleteId: (id: number) => void
}

function LineItem(props: LineItemProps) {
  const { id, image, name, highestBid, numBids, active, setSearchParams, setDeleteId } = props

  const navigate = useNavigate()

  const priceStr = `$${safeParseFloat(highestBid).toFixed(2)}`

  const onClick = useCallback(() => {
    setSearchParams({ id })
  }, [setSearchParams, id])

  const onEdit = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      e.stopPropagation()
      navigate(`/update_listing/?id=${id}`)
    },
    [id, navigate],
  )

  const onDelete = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      e.stopPropagation()
      setDeleteId(id)
    },
    [setDeleteId, id],
  )

  return (
    <Row
      className={`my_listing align-items-center ${active ? "active" : "delisted"}`}
      onClick={onClick}
    >
      {active ? (
        <div className="icon-bar">
          <div>
            <Icon name="edit" className="card-edit" onClick={onEdit} />
            <Icon name="trash" className="card-trash" onClick={onDelete} />
          </div>
        </div>
      ) : null}
      <Col xs={3} align="center">
        <img src={`/${image}`} alt="Listing Preview" />
      </Col>
      <Col xs={5}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <b>
            <span>{name}</span>
            {active ? null : <span className="red">&nbsp;(delisted)</span>}
          </b>
          <strong>{`${numBids} bid${numBids === 1 ? "" : "s"}`}</strong>
        </div>
      </Col>
      <Col xs={1} />
      <Col xs={3}>
        <div>{numBids === 0 ? "No Bids" : "Highest Bid:"}</div>
        <div>
          <b>{priceStr}</b>
        </div>
      </Col>
    </Row>
  )
}

export default function MyListings() {
  const [myListings, setMyListings] = useState<SearchItem[]>([])
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const [searchParams, setSearchParams] = useSearchParams()
  const params = useMemo(() => Object.fromEntries([...searchParams]), [searchParams])

  const selectedItemId = safeParseFloat(params.id)
  const selectedItem = myListings.find((item: SearchItem) => item.id === selectedItemId)

  const { user } = useSelector((state: AppState) => state)

  const deselectItem = useCallback(() => {
    setSearchParams({})
  }, [setSearchParams])

  const closeConfirmDeleteModal = useCallback(() => {
    setDeleteId(null)
  }, [])

  useEffect(() => {
    getSearchItems(
      { sellerItemsOnly: true },
      (results: SearchItemResponse) => {
        setMyListings(results)
      },
      () => {},
    )
  }, [])

  const lineItems = (myListings as ListingProps[]).map((listing) => (
    <LineItem
      {...listing}
      key={listing.id}
      setSearchParams={setSearchParams}
      setDeleteId={setDeleteId}
    />
  ))

  return (
    <>
      <ListingModal
        show={!!selectedItem}
        onHide={deselectItem}
        selectedItem={{ ...selectedItem, seller: user }}
      />
      <ConfirmationModal show={!!deleteId} onHide={closeConfirmDeleteModal} itemId={deleteId} />
      <Row>
        <h1 className="column-heading-centered">My Listings</h1>
        <Col xs={2} />
        <Col xs={8}>
          {lineItems.length ? (
            lineItems
          ) : (
            <div className="column-heading-centered">
              You do not have any listings yet. Consider{" "}
              <Link to="/create_listing">creating one</Link> now!
            </div>
          )}
        </Col>
        <Col xs={2} />
      </Row>
    </>
  )
}
