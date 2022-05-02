import * as React from "react"
import { useSearchParams } from "react-router-dom"
import { useEffect, useMemo, useSelector, useState } from "../base/react_base"
import { safeParseInt } from "../base/util"
import { AppState, User } from "../base/reducers"
import { apiCall as getUser, Response as GetUserResponse } from "../api/get_user"
import MyAccount from "./my_account"
import PublicProfile from "./public_profile"

export default function UserProfile() {
  const activeUser = useSelector((state: AppState) => state.user)

  const [searchParams] = useSearchParams()
  const params = useMemo(() => Object.fromEntries([...searchParams]), [searchParams])
  const userId = safeParseInt(params.id)

  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (userId) {
      getUser(
        { userId },
        (response: GetUserResponse) => {
          setUser({
            email: response[0].email,
            firstName: response[0].firstName,
            lastName: response[0].lastName,
            bio: response[0]?.bio || "",
            image: response[0]?.image || "",
            id: userId,
          })
        },
        () => {},
      )
    }
  }, [userId])

  if (user) {
    if (userId === activeUser?.id) {
      return <MyAccount unmodifiedUser={user} />
    }
    return <PublicProfile user={user} />
  }
  return <div />
}
