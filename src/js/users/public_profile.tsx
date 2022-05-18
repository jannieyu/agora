import * as React from "react"
import { User } from "../base/reducers"

interface PublicProfileProps {
  user: User
}

export default function PublicProfile(props: PublicProfileProps) {
  const { user } = props

  return (
    <div className="user-profile-container">
      <div className="user-profile-inner">
        <div className="text-centered">
          <img
            alt="profile"
            src={user?.image ? `/${user?.image}` : "/images/assets/default-user-icon.png"}
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
      </div>
    </div>
  )
}
