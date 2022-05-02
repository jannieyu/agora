import * as React from "react"
import { Row, Col } from "react-bootstrap"
import { User } from "../base/reducers"

interface PublicProfileProps {
  user: User
}

export default function PublicProfile(props: PublicProfileProps) {
  const { user } = props

  return (
    <Row className="user-profile">
      <Col xs={3} />
      <Col xs={6}>
        <div className="text-centered">
          <img
            alt="profile"
            src={user?.image ? `/${user?.image}` : "/images/assets/default-user-icon.png"}
            style={{ maxWidth: "100%" }}
          />
        </div>
        <br />
        <div className="profile-metadata">
          <h2>
            <span>{user?.firstName}</span> <span>{user?.lastName}</span>{" "}
          </h2>
          <h3>{`${user?.email}`}</h3>
          <p>{user?.bio}</p>
        </div>
      </Col>
      <Col xs={3} />
    </Row>
  )
}
