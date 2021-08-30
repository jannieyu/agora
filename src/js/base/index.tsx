import * as React from "react"
import * as ReactDOM from "react-dom"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Home from "./home"
import About from "./about"
import "./styles.scss"

ReactDOM.render(
  <Router>
    <Routes>
      <Route path="/">
        <Home />
      </Route>
      <Route path="/about">
        <About />
      </Route>
    </Routes>
  </Router>,
  document.getElementById("root"),
)
