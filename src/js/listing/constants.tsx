import * as React from "react"

export const categories = [
  {
    key: "Apparel",
    value: "Apparel",
    text: "Apparel",
  },
  {
    key: "Mens",
    value: "Apparel/Mens",
    text: "Apparel/Mens",
    // Example of how we can create intented items in dropdown:
    content: <div>{"\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0 Mens"}</div>,
  },
  {
    key: "Womens",
    value: "Apparel/Womens",
    text: "Apparel/Womens",
    // Example of how we can create intented items in dropdown:
    content: <div>{"\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0 Womens"}</div>,
  },
  {
    key: "Books",
    value: "Books",
    text: "Books",
  },
  {
    key: "Furniture",
    value: "Furniture",
    text: "Furniture",
  },
]

export const conditions = [
  {
    key: "New",
    value: "New",
    text: "New",
  },
  {
    key: "Lightly Used",
    value: "Lightly Used",
    text: "Lightly Used",
  },
  {
    key: "Well Loved",
    value: "Well Loved",
    text: "Well Loved",
  },
]
