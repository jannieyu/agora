import * as React from "react"
import { Modal } from "react-bootstrap"
import { Button, Form, Message } from "semantic-ui-react"
import { useCallback, useState } from "./react_base"
import { apiCall as delistCall } from "../api/delist_item"

interface ModalProps {
  onHide: () => void
  delistFollowup: (itemId: number) => void
  show: boolean
  itemId: number
}

export default function ConfirmationModal(props: ModalProps) {
  const { show, onHide, itemId, delistFollowup } = props

  const [loading, setLoading] = useState<boolean>(false)
  const [hasError, setHasError] = useState<boolean>(false)

  const hideAndReset = useCallback(() => {
    onHide()
    setLoading(false)
    setHasError(false)
  }, [onHide, setLoading, setHasError])

  const onDelist = useCallback(() => {
    delistCall(
      { itemId },
      () => {
        delistFollowup(itemId)
        hideAndReset()
      },
      () => {
        setHasError(true)
      },
    )
  }, [hideAndReset, setHasError, itemId, delistFollowup])

  return (
    <Modal
      show={show}
      onHide={hideAndReset}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Delist Item</Modal.Title>
      </Modal.Header>
      <Form className="login-form" error={hasError} loading={loading}>
        <p>Please confirm that you would like to delist this item. This action is irreversible.</p>
        <Button type="submit" onClick={onDelist} negative>
          Delist Item
        </Button>
        <Message error header="Error" content="The item could not be delisted." />
      </Form>
    </Modal>
  )
}
