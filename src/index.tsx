import React from "react"
import { render } from "react-dom"

const HelloWorld = () => (
  <div className="App">
    <h1> Hello, World!</h1>
  </div>
)

render(<HelloWorld />, document.getElementById("app"))
