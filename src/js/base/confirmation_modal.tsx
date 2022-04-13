import * as React from "react"
import { Modal } from "react-bootstrap"
import { Button, Form, Message } from "semantic-ui-react"
import { useCallback, useState } from "./react_base"
import { apiCall as loginCall } from "../api/login"
import { Response as LoginStatusResponse } from "../api/get_login_status"

interface ModalProps {
  onHide: () => void
  show: boolean
  itemId: number
}

export default function ConfirmationModal(props: ModalProps) {
  const { show, onHide, itemId } = props

  const [loading, setLoading] = useState<boolean>(false)
  const [hasError, setHasError] = useState<boolean>(false)

  const hideAndReset = useCallback(() => {
    onHide()
    setLoading(false)
    setHasError(false)
  }, [onHide, setLoading, setHasError])

  const onDelete = useCallback(() => {
    console.log("deleting...")
    hideAndReset()
  }, [hideAndReset])

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
        <p>Please confirm that you would like to delist this item.</p>
        <Button type="submit" onClick={onDelete} negative>
          Delist Item
        </Button>
        <Message error header="Error" content="The item could not be delisted." />
      </Form>
    </Modal>
  )
}
