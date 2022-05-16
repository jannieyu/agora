import * as React from "react"
import { DateTime } from "luxon"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useCallback, useEffect, useState } from "./react_base"

interface CountdownProps {
  endTime: DateTime | null
  showClock: boolean
}

function Countdown(props: CountdownProps) {
  const { endTime, showClock } = props

  const [dayStr, setDayStr] = useState<string>("00")
  const [hourStr, setHourStr] = useState<string>("00")
  const [minStr, setMinStr] = useState<string>("00")
  const [secStr, setSecStr] = useState<string>("00")

  const tick = useCallback(() => {
    // Time remaining in seconds
    const secondsRemaining = Math.max(
      0,
      Math.floor(((endTime?.ts || 0) - DateTime.now().ts) / 1000),
    )

    const d = Math.floor(secondsRemaining / (3600 * 24))
    const h = Math.floor((secondsRemaining % (3600 * 24)) / 3600)
    const m = Math.floor((secondsRemaining % 3600) / 60)
    const s = Math.floor(secondsRemaining % 60)

    setDayStr(`00${d}`.slice(-2))
    setHourStr(`00${h}`.slice(-2))
    setMinStr(`00${m}`.slice(-2))
    setSecStr(`00${s}`.slice(-2))
  }, [endTime])

  useEffect(() => {
    tick()
    const timerId = setInterval(tick, 1000)
    return () => clearInterval(timerId)
  }, [tick])

  return endTime ? (
    <span>
      {showClock && <FontAwesomeIcon icon="clock" className="clock-icon" />}
      <span>{`${dayStr}:${hourStr}:${minStr}:${secStr}`}</span>
    </span>
  ) : (
    <span />
  )
}

export default Countdown
