import React from "react"
import { render } from "react-dom"
import "./styles.css"

const HelloWorld = () => (
  <div className="app">
    <h1> Hello, World!</h1>
  </div>
)

render(<HelloWorld />, document.getElementById("app"))
