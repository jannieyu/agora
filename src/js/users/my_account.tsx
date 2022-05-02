import * as React from "react"
import { Row, Col, OverlayTrigger, Popover, Modal } from "react-bootstrap"
import { isEqual } from "lodash"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Form, Input, Message, TextArea } from "semantic-ui-react"
import { User } from "../base/reducers"
import { useCallback, useDispatch, useEffect, useState } from "../base/react_base"
import ImageUploadModal from "./image_upload_modal"
import { setData } from "../base/actions"

interface SubmissionModalProps {
  onHide: () => void
  show: boolean
  wasSuccess: boolean
}

function SubmissionModal(props: SubmissionModalProps) {
  const { onHide, show, wasSuccess } = props

  const message = wasSuccess
    ? "Your profile was updated successfully!"
    : "We are sorry, we were unable to successfully update your profile."

  const headerMsg = wasSuccess ? "Success!" : "Error"

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">{headerMsg}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col xs="12" align="center">
            <Message
              error={!wasSuccess}
              success={wasSuccess}
              header={headerMsg}
              content={message}
            />
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  )
}

interface MyAccountProps {
  originalUser: User
  updateOriginalUser: (user: User) => void
  fetchUser: () => void
}

export default function MyAccount(props: MyAccountProps) {
  const { originalUser, updateOriginalUser, fetchUser } = props

  const [user, setUser] = useState<User>(originalUser)
  const [showImageUploadModal, setShowImageUploadModal] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false)
  const [showFailureModal, setShowFailureModal] = useState<boolean>(false)

  const dispatch = useDispatch()

  useEffect(() => {
    setUser(originalUser)
  }, [originalUser])

  const updateUser = useCallback(
    (newUser: User) => {
      dispatch(setData({ user: newUser }))
      updateOriginalUser(newUser)
    },
    [dispatch, updateOriginalUser],
  )

  const hideSubmissionModal = useCallback(() => {
    setShowSuccessModal(false)
    setShowFailureModal(false)
  }, [])

  const hideImageUploadModal = useCallback(() => {
    setShowImageUploadModal(false)
  }, [])

  const onIconClick = useCallback(() => {
    setShowImageUploadModal(true)
  }, [])

  const handleChangeFirstName = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setUser({ ...user, firstName: e.currentTarget.value })
    },
    [user, setUser],
  )

  const handleChangeLastName = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setUser({ ...user, lastName: e.currentTarget.value })
    },
    [user, setUser],
  )

  const handleChangeEmail = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setUser({ ...user, email: e.currentTarget.value })
    },
    [user, setUser],
  )

  const handleChangeBio = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setUser({ ...user, bio: e.currentTarget.value })
    },
    [user, setUser],
  )

  const canSubmit = user?.firstName && user?.lastName && user?.email && !isEqual(user, originalUser)

  const onSubmit = useCallback(async () => {
    const formData = new FormData()
    formData.append("firstName", user.firstName)
    formData.append("lastName", user.lastName)
    formData.append("email", user.email)
    formData.append("bio", user.bio)
    formData.append("image", "")

    setSubmitting(true)
    const response = await fetch("/api/update_user", {
      method: "POST",
      body: formData,
    })
    if (response.status >= 200 && response.status <= 299) {
      setSubmitting(false)
      setShowSuccessModal(true)
      setShowFailureModal(false)
      updateUser(user)
    } else {
      setSubmitting(false)
      setShowSuccessModal(false)
      setShowFailureModal(true)
    }
  }, [user, updateUser])

  const submitBtn = (
    <Button disabled={!canSubmit} type="submit" loading={submitting} onClick={onSubmit} positive>
      Submit Changes
    </Button>
  )

  const wrappedSubmitBtn = canSubmit ? (
    submitBtn
  ) : (
    <OverlayTrigger
      placement="right"
      trigger={["hover", "focus"]}
      overlay={
        <Popover>
          <Popover.Body>
            All fields must be non-empty and there must be at least one change to submit.
          </Popover.Body>
        </Popover>
      }
    >
      <span>{submitBtn}</span>
    </OverlayTrigger>
  )

  return (
    <>
      <SubmissionModal
        onHide={hideSubmissionModal}
        show={showSuccessModal || showFailureModal}
        wasSuccess={showSuccessModal}
      />
      <ImageUploadModal
        show={showImageUploadModal}
        onHide={hideImageUploadModal}
        onSuccess={fetchUser}
        initialImageURL={user?.image || ""}
      />
      <Row className="user-profile">
        <Col xs={3} />
        <Col xs={6}>
          <div className="text-centered">
            <div className="edit-icon">
              <FontAwesomeIcon icon="pen-to-square" size="2x" onClick={onIconClick} />
            </div>
            <img
              alt="profile"
              src={user?.image ? `/${user?.image}` : "/images/assets/default-user-icon.png"}
            />
          </div>
          <br />
          <div className="profile-metadata">
            <Form>
              <Row>
                <Col xs="6">
                  <Form.Field
                    control={Input}
                    label="First Name"
                    placeholder="Jane"
                    value={user?.firstName || ""}
                    onChange={handleChangeFirstName}
                  />
                </Col>
                <Col xs="6">
                  <Form.Field
                    control={Input}
                    label="Last Name"
                    placeholder="Doe"
                    value={user?.lastName || ""}
                    onChange={handleChangeLastName}
                  />
                </Col>
              </Row>
              <br />
              <Row>
                <Col xs="12">
                  <Form.Field
                    control={Input}
                    label="Email"
                    placeholder="janedoe@caltech.edu"
                    value={user?.email || ""}
                    onChange={handleChangeEmail}
                  />
                </Col>
              </Row>
              <br />
              <Row>
                <Col xs="12">
                  <Form.Field
                    control={TextArea}
                    label="Bio"
                    placeholder="Enter bio here"
                    value={user?.bio || ""}
                    onChange={handleChangeBio}
                  />
                </Col>
              </Row>
              <br />
              <Row>
                <Col xs={6}>{wrappedSubmitBtn}</Col>
              </Row>
            </Form>
          </div>
        </Col>
        <Col xs={3} />
      </Row>
      <div className="footer" />
    </>
  )
}
