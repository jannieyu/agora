import * as React from "react"
import { Icon } from "semantic-ui-react"
import { useNavigate } from "react-router"
import { apiCall as recordItemClick } from "../api/record_item_click"
import { ActionType, ListingProps } from "./types"
import { useCallback, useSelector } from "../base/react_base"
import { AppState } from "../base/reducers"
import { safeParseFloat } from "../base/util"

export interface CardProps extends ListingProps {
  handleClick: (id: number, type: ActionType) => void
  itemId: number
}

export default function Card(props: CardProps) {
  const { category, name, highestBid, condition, numBids, image, handleClick, itemId, sellerId } =
    props
  const navigate = useNavigate()

  const handleSelectCard = useCallback(() => {
    handleClick(itemId, ActionType.SELECT)
    recordItemClick(
      { itemId },
      () => {},
      () => {},
    )
  }, [itemId, handleClick])

  const handleDeleteItem = useCallback(() => {
    handleClick(itemId, ActionType.DELETE)
  }, [itemId, handleClick])

  const activeUser = useSelector((state: AppState) => state.user)

  const onDelete = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      e.stopPropagation()
      // Open confirmation modal
      handleDeleteItem()
    },
    [handleDeleteItem],
  )

  const onEdit = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      e.stopPropagation()
      navigate(`/update_listing/?id=${itemId}`)
    },
    [navigate, itemId],
  )

  return (
    <div
      className="card"
      onClick={handleSelectCard}
      onKeyPress={handleSelectCard}
      role="button"
      tabIndex={0}
    >
      <h2>{name}</h2>
      <div>
        <img src={`/${image}`} alt="Listing Preview" className="card-image" />
      </div>
      <div className="card-metadata">
        <div>
          <div className="major-metadata">
            <span>
              <b>{`$${safeParseFloat(highestBid)?.toFixed(2)}`}</b>
            </span>
          </div>
          <div>{category}</div>
          <div>{condition}</div>
        </div>
        {sellerId === activeUser?.id ? (
          <div>
            <Icon name="edit" className="card-edit" onClick={onEdit} />
            <Icon name="trash" className="card-trash" onClick={onDelete} />
          </div>
        ) : (
          <div>{`${numBids} bid${numBids === 1 ? "" : "s"}`}</div>
        )}
      </div>
    </div>
  )
}
