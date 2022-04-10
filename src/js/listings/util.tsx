export default function isValidPrice(input: string) {
  const pattern = /(?=.*?\d)^\$?(([1-9]\d{0,2}(,\d{3})*)|\d+)?(\.\d{1,2})?$/
  return pattern.test(input)
}
