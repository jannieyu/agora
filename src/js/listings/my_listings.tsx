import * as React from "react"
import { Row, Col } from "react-bootstrap"
import { useEffect, useState } from "../base/react_base"
import {
  apiCall as getSearchItems,
  Response as SearchItemResponse,
  SearchItem,
} from "../api/get_search_items"
import { ListingProps } from "./types"

function LineItem(props: ListingProps) {
  const { name } = props

  return (
    <Row>
      <Col xs={12}>{name}</Col>
    </Row>
  )
}

export default function MyListings() {
  const [myListings, setMyListings] = useState<SearchItem[]>([])

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
    <LineItem {...listing} key={listing.id} />
  ))

  return <div>{lineItems}</div>
}
