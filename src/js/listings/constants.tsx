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
    key: "Electronics",
    value: "Electronics",
    text: "Electronics",
  },
  {
    key: "Home and Kitchen",
    value: "Home and Kitchen",
    text: "Home and Kitchen",
  },
  {
    key: "Luggage and Backpack",
    value: "Luggage and Backpack",
    text: "Luggage and Backpack",
  },
  {
    key: "Office Supplies",
    value: "Office Supplies",
    text: "Office Supplies",
  },
  {
    key: "Toys and Games",
    value: "Toys and Games",
    text: "Toys and Games",
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
