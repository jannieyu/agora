import * as React from "react"
import { useEffect } from "../base/react_base"
import { apiCall as getUser } from "../api/get_user"

export interface UserProfileProps {}

export default function UserProfile(props: UserProfileProps) {
  useEffect(() => {
    getUser(
      {},
      () => {},
      () => {},
    )
  }, [])

  return <div />
}
