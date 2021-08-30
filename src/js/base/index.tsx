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
          <Navbar.Brand href="#home">Navbar</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#features">Features</Nav.Link>
            <Nav.Link href="#pricing">Pricing</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      {children}
    </>
  )
}

const ROUTES = {
  "/": Home,
  "/about": About,
}

interface RoutedComponentProps {
  route: string
}

const RoutedComponent = (props: RoutedComponentProps) => {
  const { route } = props
  const Component = ROUTES[route]
  return (
    <Base>
      <Component />
    </Base>
  )
}

ReactDOM.render(
  <Router>
    <Routes>
      {Object.keys(ROUTES).map((route: string) => (
        <Route path={route} key={route}>
          <RoutedComponent route={route} />
        </Route>
      ))}
    </Routes>
  </Router>,
  document.getElementById("root"),
)
