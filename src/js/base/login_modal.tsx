/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-props-no-spreading */
import * as React from "react"
import { Modal } from "react-bootstrap"
import { Button, Form, Message } from "semantic-ui-react"
import { useState } from "./react_base"

interface ModalProps {
  onHide: () => void
  show: boolean
}

export default function LoginModal(props: ModalProps) {
  const { onHide } = props

  const [hasError, setHasError] = useState<boolean>(true)
  const [hasSuccess, setHasSuccess] = useState<boolean>(false)

  return (
    <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Form className="login-form" error={hasError}>
        <Form.Field>
          <label>Email</label>
          <input placeholder="janedoe@caltech.edu" />
        </Form.Field>
        <Form.Field>
          <label>Password</label>
          <input type="password" />
        </Form.Field>
        <Message
          error
          header="Error"
          content="Email and/or password do not match a valid account"
        />
        <Button type="submit">Submit</Button>
      </Form>
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}
