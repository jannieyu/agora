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
