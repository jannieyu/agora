import * as React from "react"
import { Row, Col } from "react-bootstrap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { User } from "../base/reducers"
import { useCallback, useState } from "../base/react_base"
import ImageUploadModal from "./image_upload_modal"

interface MyAccountProps {
  user: User
}

export default function MyAccount(props: MyAccountProps) {
  const { user } = props
  const [showImageUploadModal, setShowImageUploadModal] = useState<boolean>(false)

  const hideImageUploadModal = useCallback(() => {
    setShowImageUploadModal(false)
  }, [])

  const onIconClick = useCallback(() => {
    setShowImageUploadModal(true)
  }, [])

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
            <h2>
              <span contentEditable="true" spellCheck="false">
                {user?.firstName}
              </span>{" "}
              <span contentEditable="true" spellCheck="false">
                {user?.lastName}
              </span>{" "}
            </h2>
            <h3 contentEditable="true" spellCheck="false">{`${user?.email}`}</h3>
            <p contentEditable="true" spellCheck="false">
              {user?.bio}
            </p>
          </div>
        </Col>
        <Col xs={3} />
      </Row>
    </>
  )
}
