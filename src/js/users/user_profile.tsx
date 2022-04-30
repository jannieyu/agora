import * as React from "react"
import { Row, Col } from "react-bootstrap"
import ReactCrop, { Crop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useSelector, useState } from "../base/react_base"
import { apiCall as getUser, Response as GetUserResponse } from "../api/get_user"
import { AppState, User } from "../base/reducers"

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [crop, setCrop] = useState<Crop>()

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
    <Row>
      <h1 className="column-heading-centered">My Account</h1>
      <Col xs={3} />
      <Col xs={6}>
        <ReactCrop crop={crop} onChange={(c) => setCrop(c)}>
          <img alt="profile" src={`/${user?.image}`} style={{ maxWidth: "100%" }} />
        </ReactCrop>
        <div className="profile-metadata">
          <h2>
            <span contentEditable="true" spellCheck="false">
              {user?.firstName}
            </span>{" "}
            <span contentEditable="true" spellCheck="false">
              {user?.lastName}
            </span>{" "}
            <span>
              <FontAwesomeIcon icon="pen-to-square" size="xs" />
            </span>
          </h2>
          <h3 contentEditable="true" spellCheck="false">{`${user?.email}`}</h3>
          <p contentEditable="true" spellCheck="false">
            {user?.bio}
          </p>
        </div>
      </Col>
      <Col xs={3} />
    </Row>
  )
}
