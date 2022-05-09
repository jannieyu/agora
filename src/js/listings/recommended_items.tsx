import * as React from "react"
import { useSearchParams } from "react-router-dom"
import { Row, Col } from "react-bootstrap"
import {
  apiCall as getSearchItems,
  Response as GetSearchItemsResponse,
} from "../api/get_search_items"
import { useCallback, useEffect, useMemo, useSelector, useState } from "../base/react_base"
import { AppState } from "../base/reducers"
import { ActionType, ListingProps } from "./types"
import CardRow from "./card_rows"

interface RecommendedItemsProps {
  category: string
  itemId: number
}

export default function RecommendedItems(props: RecommendedItemsProps) {
  const { category, itemId } = props
  const [items, setItems] = useState<ListingProps[]>([])
  const { user } = useSelector((state: AppState) => state)

  const [searchParams, setSearchParams] = useSearchParams()
  const params = useMemo(() => Object.fromEntries([...searchParams]), [searchParams])

  useEffect(() => {
    getSearchItems(
      {
        category,
        sort: "mostViewed",
      },
      (response: GetSearchItemsResponse) => {
        setItems(
          response.filter(
            (item) => item.sellerId !== user?.id && item.id !== itemId,
          ) as ListingProps[],
        )
      },
      () => {},
    )
  }, [category, itemId, user])

  const handleClick = useCallback(
    (id: number, actionType: ActionType) => {
      if (actionType === ActionType.SELECT) {
        setSearchParams({ ...params, itemId: `${id}` })
      }
    },
    [params, setSearchParams],
  )

  return items.length > 0 ? (
    <Row>
      <Col xs={1} />
      <Col xs={10}>
        <h3>You May Also Be Interested In:</h3>
        <CardRow cards={items} handleClick={handleClick} />
      </Col>
      <Col xs={1} />
    </Row>
  ) : null
}
