import { safeParseFloat } from "../base/util"

export function isValidPrice(input: string) {
  const pattern = /(?=.*?\d)^\d?(([1-9]\d{0,2}(,\d{3})*)|\d+)?(\.\d{1,2})?$/
  if (!pattern.test(input)) {
    return false
  }
  const numericPrice = safeParseFloat(input)
  return numericPrice > 0 && numericPrice <= 999999.99
}

/*
 * [x, y] means that if the current price is under x the current increment is y
 *
 */

const bidIncrements = [
  [1, 0.05],
  [5, 0.25],
  [25, 0.5],
  [100, 1.0],
  [250, 2.5],
  [500, 5.0],
  [1000, 10.0],
  [2500, 25.0],
  [5000, 50.0],
]

export function calculateIncrement(price: number) {
  let increment = 100.0

  for (let i = 0; i < bidIncrements.length; i += 1) {
    const [priceCeil, currIncrement] = bidIncrements[i]
    if (price < priceCeil) {
      increment = currIncrement
      break
    }
  }

  return increment
}
