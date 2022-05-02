import * as React from "react"
import { Row, Col, OverlayTrigger, Popover } from "react-bootstrap"
import { isEqual } from "lodash"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Form, Input, TextArea } from "semantic-ui-react"
import { User } from "../base/reducers"
import { useCallback, useState } from "../base/react_base"
import ImageUploadModal from "./image_upload_modal"

interface MyAccountProps {
  unmodifiedUser: User
}

export default function MyAccount(props: MyAccountProps) {
  const { unmodifiedUser } = props

  const [user, setUser] = useState<User>(unmodifiedUser)
  const [showImageUploadModal, setShowImageUploadModal] = useState<boolean>(false)

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

  const canSubmit =
    user?.firstName && user?.lastName && user?.email && !isEqual(user, unmodifiedUser)

  const submitBtn = (
    <Button disabled={!canSubmit} type="submit" positive>
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
      <ImageUploadModal show={showImageUploadModal} onHide={hideImageUploadModal} />
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
              style={{ maxWidth: "100%" }}
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
