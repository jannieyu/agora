import * as React from "react"
import { Modal } from "react-bootstrap"
import { Message } from "semantic-ui-react"
import { useCallback, useState } from "../base/react_base"
import BidForm, { RefinedBidFormProps } from "../listings/bid_form"

type BidModalProps = RefinedBidFormProps & {
  isAutomatic: boolean
  show: boolean
  onHide: () => void
}

export default function BidModal(props: BidModalProps) {
  const { price, isAutomatic, show, onHide } = props

  const [successMessage, setSuccessMessage] = useState<string>("")

  const handleSuccess = useCallback((message: string) => {
    setSuccessMessage(message)
  }, [])

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Place Bid</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {successMessage ? (
          <Message success>{successMessage}</Message>
        ) : (
          <BidForm
            {...props}
            priceStr={`${price}`}
            handleSuccess={handleSuccess}
            defaultAutomatic={isAutomatic}
          />
        )}
      </Modal.Body>
    </Modal>
  )
}
