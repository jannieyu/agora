import * as React from "react"
import { Row, Col } from "react-bootstrap"
import { Button, Dropdown, Icon, Input, Form } from "semantic-ui-react"
import { useSearchParams } from "react-router-dom"
import { categories, conditions } from "../listings/constants"
import { useCallback, useDispatch, useEffect, useMemo, useSelector, useState } from "./react_base"
import {
  apiCall as getSearchItems,
  Response as GetSearchItemsResponse,
} from "../api/get_search_items"
import { ListingProps } from "../listings/types"
import Card from "../listings/card"
import ListingModal from "../listings/listing_modal"
import ConfirmationModal from "./confirmation_modal"
import { ActionType, OnChangeObject } from "./types"
import { AppState, SearchItem } from "./reducers"
import { setData } from "./actions"
import { safeParseFloat } from "./util"

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
    key: "recent",
    value: "recent",
    text: "Sort By: Most Recent",
  },
  {
    key: "highLow",
    value: "highLow",
    text: "Sort By: Price (High to Low)",
  },
  {
    key: "lowLigh",
    value: "lowLigh",
    text: "Sort By: Price (Low to High)",
  },
]

interface CardRowProps {
  cards: ListingProps[]
  handleClick: (id: number, type: ActionType) => void
}

function CardRow(props: CardRowProps) {
  const { cards, handleClick } = props

  return (
    <>
      <Row>
        {cards.map((prop: ListingProps) => (
          <Col xs={3} key={prop.id}>
            <Card {...prop} handleClick={handleClick} itemId={prop.id} />
          </Col>
        ))}
      </Row>
      <br />
    </>
  )
}

function Home() {
  const { searchItems } = useSelector((state: AppState) => state)

  const [searchParams, setSearchParams] = useSearchParams()
  const params = useMemo(() => Object.fromEntries([...searchParams]), [searchParams])

  const [searchBarText, setSearchBarText] = useState<string>(params.search)
  const [loading, setLoading] = useState<boolean>(false)
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null)

  const dispatch = useDispatch()

  const handleCardAction = useCallback(
    (itemId: number, actionType: ActionType) => {
      if (actionType === ActionType.SELECT) {
        setSearchParams({ ...params, itemId: `${itemId}` })
      } else if (actionType === ActionType.DELETE) {
        setDeletingItemId(itemId)
      }
    },
    [params, setSearchParams],
  )

  const selectedItemId = safeParseFloat(params.itemId)
  const selectedItem = searchItems.find((item: SearchItem) => item.id === selectedItemId)

  const handleChangeCategory = useCallback(
    (e: React.FormEvent<HTMLInputElement>, data: OnChangeObject) => {
      setSearchParams({ ...params, category: data.value })
    },
    [setSearchParams, params],
  )

  const handleChangeCondition = useCallback(
    (e: React.FormEvent<HTMLInputElement>, data: OnChangeObject) => {
      setSearchParams({ ...params, condition: data.value })
    },
    [setSearchParams, params],
  )

  const handleChangeSortBy = useCallback(
    (e: React.FormEvent<HTMLInputElement>, data: OnChangeObject) => {
      setSearchParams({ ...params, sort: data.value })
    },
    [setSearchParams, params],
  )

  const handleChangeSearchText = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setSearchBarText(e.currentTarget.value)
  }, [])

  const search = useCallback(() => {
    setSearchParams({ ...params, search: searchBarText })
  }, [params, searchBarText, setSearchParams])

  const handleSearchKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        search()
      }
    },
    [search],
  )

  const deselectItem = useCallback(() => {
    const newParams = { ...params }
    delete newParams.itemId
    setSearchParams(newParams)
  }, [params, setSearchParams])

  const retreiveItems = useCallback(() => {
    setLoading(true)
    getSearchItems(
      {
        category: params.category,
        condition: params.condition,
        sort: params.sort,
        search: params.search,
      },
      (data: GetSearchItemsResponse) => {
        dispatch(
          setData({
            searchItems: data,
          }),
        )
        setLoading(false)
      },
      () => {
        setLoading(false)
      },
    )
  }, [dispatch, params.search, params.category, params.condition, params.sort])

  useEffect(() => {
    retreiveItems()
  }, [retreiveItems])

  const closeConfirmDeleteModal = useCallback(() => {
    setDeletingItemId(null)
    retreiveItems()
  }, [setDeletingItemId, retreiveItems])

  const cardRows = useMemo(() => {
    const rows = []
    for (let i = 0; i < searchItems.length; i += 4) {
      const cards: ListingProps[] = []
      for (let j = 0; j < 4; j += 1) {
        if (i + j < searchItems.length) {
          cards.push(searchItems[i + j])
        }
      }
      rows.push(<CardRow cards={cards} key={i} handleClick={handleCardAction} />)
    }
    return rows
  }, [handleCardAction, searchItems])

  return (
    <>
      <ConfirmationModal
        show={!!deletingItemId}
        onHide={closeConfirmDeleteModal}
        itemId={deletingItemId}
        delistFollowup={() => {}}
      />
      <ListingModal show={!!selectedItem} onHide={deselectItem} selectedItem={selectedItem} />
      <Row>
        <Col xs={2} />
        <Col xs={8} align="center">
          <Input
            action
            size="large"
            placeholder="Search..."
            fluid
            value={searchBarText}
            onChange={handleChangeSearchText}
            onKeyPress={handleSearchKeyPress}
          >
            <Dropdown
              button
              basic
              floating
              options={categoryOptions}
              onChange={handleChangeCategory}
              value={params.category || "all"}
            />
            <Dropdown
              button
              basic
              floating
              options={conditionOptions}
              className="softly-rounded"
              onChange={handleChangeCondition}
              value={params.condition || "any"}
            />
            <input />
            <Button type="submit" onClick={search} icon>
              <Icon name="search" />
            </Button>
          </Input>
        </Col>
        <Col xs={2} />
      </Row>
      <br />
      <Form loading={loading}>
        <Row>
          <Col xs={12}>
            <div className="results-row">
              <b>{searchItems.length} Results</b>
              <Dropdown
                button
                basic
                floating
                options={sortByOptions}
                value={params.sort || "recent"}
                onChange={handleChangeSortBy}
              />
            </div>
          </Col>
        </Row>
        <br />

        {cardRows}
      </Form>
    </>
  )
}

export default Home
