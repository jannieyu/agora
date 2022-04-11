import * as React from "react"
import { Icon } from "semantic-ui-react"
import { useNavigate } from "react-router"
import { ListingProps } from "./listing"
import { useCallback, useSelector } from "../base/react_base"
import { AppState } from "../base/reducers"

export interface CardProps extends ListingProps {
  handleClick: (idx: number) => void
  rowIndex: number
  colIndex: number
}

export default function Card(props: CardProps) {
  const { category, name, price, condition, image, handleClick, rowIndex, colIndex, seller } = props
  const navigate = useNavigate()

  const handleSelectCard = useCallback(() => {
    handleClick(rowIndex + colIndex)
  }, [rowIndex, colIndex, handleClick])

  const activeUser = useSelector((state: AppState) => state.user)

  const onDelete = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    e.stopPropagation()
    // Open confirmation modal
  }, [])

  const onEdit = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      e.stopPropagation()
      navigate("/create_listing")
    },
    [navigate],
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
        <img src={image} alt="Listing Preview" className="card-image" />
      </div>
      <div className="card-metadata">
        <div>
          <div className="major-metadata">
            <span>
              <b>{price.startsWith("$") ? price : `$${price}`}</b>
            </span>
          </div>
          <div>{category}</div>
          <div>{condition}</div>
        </div>
        {seller.id !== activeUser?.id ? (
          <div>
            <Icon name="edit" className="card-edit" onClick={onEdit} />
            <Icon name="trash" className="card-trash" onClick={onDelete} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
