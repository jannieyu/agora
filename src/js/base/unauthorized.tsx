import * as React from "react"
import { Link } from "react-router-dom"

interface UnathorizedProps {
  loggedIn: boolean
}

export default function Unauthorized(props: UnathorizedProps) {
  const { loggedIn } = props
  return (
    <>
      <h1>Unauthorized</h1>
      <p>
        You are not authorized to view this page. Please {loggedIn ? "" : "log in or "}return to the{" "}
        <Link to="/">home page</Link>.
      </p>
    </>
  )
}
