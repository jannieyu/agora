import * as React from "react"
import { Modal } from "react-bootstrap"
import { Message } from "semantic-ui-react"
import { useCallback, useState } from "../base/react_base"
import { RefinedBidFormProps, ManualBidForm, AutomaticBidForm } from "../listings/bid_form"

type BidModalProps = RefinedBidFormProps & {
  isAutomatic: boolean
  show: boolean
  onHide: () => void
}

export default function BidModal(props: BidModalProps) {
  const { isAutomatic, show, onHide } = props

  const [successMessage, setSuccessMessage] = useState<string>("")

  const handleSuccess = useCallback((message: string) => {
    setSuccessMessage(message)
  }, [])

  const bidForms = isAutomatic ? (
    <AutomaticBidForm {...props} handleSuccess={handleSuccess} />
  ) : (
    <ManualBidForm {...props} handleSuccess={handleSuccess} />
  )

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="sm"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Place Bid</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {successMessage ? <Message success>{successMessage}</Message> : bidForms}
      </Modal.Body>
    </Modal>
  )
}
