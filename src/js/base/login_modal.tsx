import * as React from "react"
import { Modal } from "react-bootstrap"
import { Button, Form, Message, Input } from "semantic-ui-react"
import { useCallback, useDispatch, useState } from "./react_base"
import { setData } from "./actions"
import { apiCall as loginCall } from "../api/login"
import { Response as LoginStatusResponse } from "../api/get_login_status"

interface ModalProps {
  onHide: () => void
  show: boolean
  isSignUp: boolean
}

export default function LoginModal(props: ModalProps) {
  const { onHide, isSignUp, show } = props

  const dispatch = useDispatch()

  const [authenticating, setAuthenticating] = useState<boolean>(false)
  const [hasError, setHasError] = useState<boolean>(false)
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [firstName, setFirstName] = useState<string | null>(null)
  const [lastName, setLastName] = useState<string | null>(null)

  const hideAndReset = useCallback(() => {
    setAuthenticating(false)
    setHasError(false)
    setEmail("")
    setPassword("")
    setFirstName(null)
    setLastName(null)
    onHide()
  }, [onHide])

  const onLogin = useCallback(() => {
    setAuthenticating(true)
    loginCall(
      {
        email,
        password,
        isSignUp,
        firstName,
        lastName,
      },
      (data: LoginStatusResponse) => {
        setHasError(false)
        dispatch(
          setData({
            user: data,
          }),
        )
        hideAndReset()
      },
      () => {
        setHasError(true)
        setAuthenticating(false)
      },
    )
  }, [dispatch, hideAndReset, email, password, isSignUp, firstName, lastName])

  const handleChangeEmail = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setEmail(e.currentTarget.value)
    setHasError(false)
  }, [])

  const handleChangePassword = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setPassword(e.currentTarget.value)
    setHasError(false)
  }, [])

  const handleChangeFirstName = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setFirstName(e.currentTarget.value)
  }, [])

  const handleChangeLastName = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setLastName(e.currentTarget.value)
  }, [])

  const canSubmit = email && password && (!isSignUp || (firstName && lastName))

  return (
    <Modal
      show={show}
      onHide={hideAndReset}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {isSignUp ? "Sign Up" : "Log In"}
        </Modal.Title>
      </Modal.Header>
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
        {isSignUp ? (
          <Form.Group widths="equal">
            <Form.Input
              fluid
              label="First name"
              placeholder="First name"
              onChange={handleChangeFirstName}
            />
            <Form.Input
              fluid
              label="Last name"
              placeholder="Last name"
              onChange={handleChangeLastName}
            />
          </Form.Group>
        ) : null}
        <Message
          error
          header="Error"
          content={
            isSignUp
              ? "An account with that email address is already taken"
              : "Email and/or password do not match a valid account"
          }
        />
        <Button type="submit" onClick={onLogin} disabled={!canSubmit} positive>
          Submit
        </Button>
      </Form>
    </Modal>
  )
}
