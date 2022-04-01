/* eslint-disable react/jsx-props-no-spreading */
import * as React from "react"
import { Modal } from "react-bootstrap"
import { Button, Form, Message, Input } from "semantic-ui-react"
import { useCallback, useDispatch, useState } from "./react_base"
import setData from "./actions"
import { apiCall as loginCall } from "../api/login"
import { Response as LoginStatusResponse } from "../api/get_login_status"

interface ModalProps {
  onHide: () => void
  show: boolean
}

export default function LoginModal(props: ModalProps) {
  const { onHide } = props

  const dispatch = useDispatch()

  const [authenticating, setAuthenticating] = useState<boolean>(false)
  const [hasError, setHasError] = useState<boolean>(false)
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")

  const onLogin = useCallback(() => {
    setAuthenticating(true)
    loginCall(
      {
        email,
        password,
      },
      (data: LoginStatusResponse) => {
        setHasError(false)
        dispatch(
          setData({
            user: data,
          }),
        )
        setEmail("")
        setPassword("")
        onHide()
        setAuthenticating(false)
      },
      () => {
        setHasError(true)
        setAuthenticating(false)
      },
    )
  }, [dispatch, onHide, email, password])

  const handleChangeEmail = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setEmail(e.currentTarget.value)
    setHasError(false)
  }, [])

  const handleChangePassword = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setPassword(e.currentTarget.value)
    setHasError(false)
  }, [])

  return (
    <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
      <Form className="login-form" error={hasError} loading={authenticating}>
        <Form.Field
          control={Input}
          label="Email"
          placeholder="janedoe@caltech.edu"
          onChange={handleChangeEmail}
        />
        <Form.Field
          control={Input}
          label="Password"
          onChange={handleChangePassword}
          type="password"
        />
        <Message
          error
          header="Error"
          content="Email and/or password do not match a valid account"
        />
        <Button type="submit" onClick={onLogin} disabled={!email || !password}>
          Submit
        </Button>
      </Form>
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}
