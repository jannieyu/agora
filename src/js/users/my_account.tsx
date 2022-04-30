import * as React from "react"
import ReactCrop, { Crop } from "react-image-crop"
import { Row, Col } from "react-bootstrap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { apiCall as getUser, Response as GetUserResponse } from "../api/get_user"
import { AppState, User } from "../base/reducers"
import { useCallback, useEffect, useSelector, useState } from "../base/react_base"
import ImageUploadModal from "./image_upload_modal"

export default function MyAccount() {
  const [user, setUser] = useState<User | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [showImageUploadModal, setShowImageUploadModal] = useState<boolean>(false)

  const hideImageUploadModal = useCallback(() => {
    setShowImageUploadModal(false)
  }, [])

  const onIconClick = useCallback(() => {
    setShowImageUploadModal(true)
  }, [])

  const activeUser = useSelector((state: AppState) => state.user)

  useEffect(() => {
    if (activeUser) {
      getUser(
        null,
        (response: GetUserResponse) => {
          setUser({
            email: response[0].email,
            firstName: response[0].firstName,
            lastName: response[0].lastName,
            bio: response[0]?.bio || "",
            image: response[0]?.image || "",
            id: activeUser.id,
          })
        },
        () => {},
      )
    }
  }, [activeUser])

  return (
    <>
      <ImageUploadModal show={showImageUploadModal} onHide={hideImageUploadModal} />
      <Row className="user-profile">
        <Col xs={3} />
        <Col xs={6}>
          <div style={{ textAlign: "center" }}>
            <div className="edit-icon">
              <FontAwesomeIcon icon="pen-to-square" size="2x" onClick={onIconClick} />
            </div>
            <ReactCrop crop={crop} onChange={(c) => setCrop(c)}>
              <img
                alt="profile"
                src={user?.image ? `/${user?.image}` : "/images/assets/default-user-icon.png"}
                style={{ maxWidth: "100%" }}
              />
            </ReactCrop>
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
