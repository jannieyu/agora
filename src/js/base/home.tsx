import * as React from "react"
import { Row, Col } from "react-bootstrap"
import { Dropdown, Input } from "semantic-ui-react"
import { categories } from "../listings/constants"
import { useEffect, useState } from "./react_base"
import {
  apiCall as getSearchItems,
  Response as GetSearchItemsResponse,
  SearchItem,
} from "../api/get_search_items"
import Listing, { ListingProps } from "../listings/listing"

const options = [
  {
    key: "all",
    value: "all",
    text: "All Categories",
  },
  ...categories,
]

interface ListingRowProps {
  listings: ListingProps[]
}

function ListingRow(props: ListingRowProps) {
  const { listings } = props

  return (
    <>
      <Row>
        {listings.map((prop: ListingProps) => (
          <Col xs={3} key={prop.id}>
            <Listing {...prop} />
          </Col>
        ))}
      </Row>
      <br />
    </>
  )
}

function Home() {
  const [searchItems, setSearchItems] = useState<SearchItem[]>([])

  useEffect(() => {
    getSearchItems(
      {},
      (data: GetSearchItemsResponse) => {
        setSearchItems(data)
      },
      () => {},
    )
  }, [])

  const listingRows = []
  for (let i = 0; i < searchItems.length; i += 4) {
    const listings: ListingProps[] = []
    for (let j = 0; j < 4; j += 1) {
      if (i + j < searchItems.length) {
        listings.push(searchItems[i + j])
      }
    }
    listingRows.push(<ListingRow listings={listings} key={i} />)
  }

  return (
    <>
      <Row>
        <Col xs={3} />
        <Col xs={6} align="center">
          <Input
            action={<Dropdown button basic floating options={options} defaultValue="all" />}
            actionPosition="left"
            icon="search"
            size="large"
            placeholder="Search..."
            fluid
          />
        </Col>
        <Col xs={3} />
      </Row>
      <br />
      <hr />
      <br />
      {listingRows}
    </>
  )
}

export default Home
