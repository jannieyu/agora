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
import { ListingProps } from "../listings/listing"
import Card from "../listings/card"

const options = [
  {
    key: "all",
    value: "all",
    text: "All Categories",
  },
  ...categories,
]

interface CardRowProps {
  cards: ListingProps[]
}

function CardRow(props: CardRowProps) {
  const { cards } = props

  return (
    <>
      <Row>
        {cards.map((prop: ListingProps) => (
          <Col xs={3} key={prop.id}>
            <Card {...prop} />
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

  const cardRows = []
  for (let i = 0; i < searchItems.length; i += 4) {
    const cards: ListingProps[] = []
    for (let j = 0; j < 4; j += 1) {
      if (i + j < searchItems.length) {
        cards.push(searchItems[i + j])
      }
    }
    cardRows.push(<CardRow cards={cards} key={i} />)
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
      {cardRows}
    </>
  )
}

export default Home
