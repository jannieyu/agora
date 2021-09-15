import * as React from "react"
import * as ReactDOM from "react-dom"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { Container } from "./ui/layout"
import { Nav, Navbar } from "./ui/navigation"
import Home from "./home"
import About from "./about"
import "./styles.scss"

interface BaseProps {
  children: React.ReactElement | React.ReactElement[]
}

const Base = (props: BaseProps) => {
  const { children } = props

  return (
    <>
      <Navbar bg="primary" variant="dark">
        <Container>
          <Navbar.Brand href="#home">Hello World!</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/about">About</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      <Container>
        <div className="content-base">{children}</div>
      </Container>
    </>
  )
}

const ROUTES = {
  "/about": About,
}

ReactDOM.render(
  <Base>
    <Router>
      <Routes>
        <Route path="/" index element={<Home />} />
        {Object.keys(ROUTES).map((route) => {
          const Component = ROUTES[route]
          return <Route path={route} key={route} element={<Component />} />
        })}
      </Routes>
    </Router>
  </Base>,
  document.getElementById("root"),
)
