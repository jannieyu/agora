import * as React from "react"
import { useSearchParams } from "react-router-dom"
import { useMemo, useSelector } from "../base/react_base"
import { safeParseInt } from "../base/util"
import { AppState } from "../base/reducers"
import MyAccount from "./my_account"
import PublicProfile from "./public_profile"

export default function UserProfile() {
  const activeUser = useSelector((state: AppState) => state.user)

  const [searchParams] = useSearchParams()
  const params = useMemo(() => Object.fromEntries([...searchParams]), [searchParams])

  if (safeParseInt(params.id) === activeUser?.id) {
    return <MyAccount />
  }
  return <PublicProfile />
}
