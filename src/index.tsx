import React from "react"
import { render } from "react-dom"
import "./styles.scss"

const HelloWorld = () => (
  <div className="app">
    <h1 className="title"> Hello, World!</h1>
  </div>
)

render(<HelloWorld />, document.getElementById("app"))
