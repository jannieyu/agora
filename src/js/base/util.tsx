import { useEffect, DependencyList } from "react"

export function safeParseFloat(input: string | null | undefined) {
  if (input) {
    return parseFloat(input)
  }
  return null
}

export function safeParseInt(input: string | null | undefined) {
  if (input) {
    return parseInt(input, 10)
  }
  return null
}

export function useDebounceEffect(fn: () => void, waitTime: number, deps?: DependencyList) {
  useEffect(() => {
    const t = setTimeout(() => {
      // eslint-disable-next-line prefer-spread
      fn.apply(undefined, deps)
    }, waitTime)

    return () => {
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps])
}
