import * as React from "react"
import { Row, Col } from "react-bootstrap"
import { Button, Dropdown, Icon, Input } from "semantic-ui-react"
import { categories, conditions } from "../listings/constants"
import { useCallback, useEffect, useState } from "./react_base"
import {
  apiCall as getSearchItems,
  Response as GetSearchItemsResponse,
  SearchItem,
} from "../api/get_search_items"
import { ListingProps } from "../listings/listing"
import Card from "../listings/card"
import ListingModal from "../listings/listing_modal"

const categoryOptions = [
  {
    key: "all",
    value: "all",
    text: "All Categories",
  },
  ...categories,
]

const conditionOptions = [
  {
    key: "any",
    value: "any",
    text: "Any Condition",
  },
  ...conditions,
]

const sortByOptions = [
  {
    key: "most_recent",
    value: "most_recent",
    text: "Sort By: Most Recent",
  },
  {
    key: "price_high_to_low",
    value: "price_high_to_low",
    text: "Sort By: Price (High to Low)",
  },
  {
    key: "price_low_to_high",
    value: "price_low_to_high",
    text: "Sort By: Price (Low to High)",
  },
]

interface CardRowProps {
  cards: ListingProps[]
  handleClick: (idx: number) => void
  rowIndex: number
}

function CardRow(props: CardRowProps) {
  const { cards, handleClick, rowIndex } = props

  return (
    <>
      <Row>
        {cards.map((prop: ListingProps, idx: number) => (
          <Col xs={3} key={prop.id}>
            <Card {...prop} handleClick={handleClick} rowIndex={rowIndex} colIndex={idx} />
          </Col>
        ))}
      </Row>
      <br />
    </>
  )
}

function Home() {
  const [searchItems, setSearchItems] = useState<SearchItem[]>([])
  const [selectedItem, setSelectedItem] = useState<SearchItem | null>(null)

  const handleCardSelect = useCallback(
    (idx: number) => {
      setSelectedItem(searchItems[idx])
    },
    [setSelectedItem, searchItems],
  )

  const deselectItem = useCallback(() => {
    setSelectedItem(null)
  }, [setSelectedItem])

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
    cardRows.push(<CardRow cards={cards} key={i} rowIndex={i} handleClick={handleCardSelect} />)
  }

  return (
    <>
      <ListingModal show={!!selectedItem} onHide={deselectItem} selectedItem={selectedItem} />
      <Row>
        <Col xs={2} />
        <Col xs={8} align="center">
          <Input action size="large" placeholder="Search..." fluid>
            <Dropdown button basic floating options={categoryOptions} defaultValue="all" />
            <Dropdown
              button
              basic
              floating
              options={conditionOptions}
              defaultValue="any"
              className="softly-rounded"
            />
            <input />
            <Button type="submit" icon>
              <Icon name="search" />
            </Button>
          </Input>
        </Col>
        <Col xs={2} />
      </Row>
      <br />
      <Row>
        <Col xs={12}>
          <div className="results-row">
            <b>{searchItems.length} Results</b>
            <Dropdown button basic floating options={sortByOptions} defaultValue="most_recent" />
          </div>
        </Col>
      </Row>
      <br />
      {cardRows}
    </>
  )
}

export default Home
