import * as React from "react"
import * as ReactDOM from "react-dom"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { library } from "@fortawesome/fontawesome-svg-core"
import { fas } from "@fortawesome/free-solid-svg-icons"
import { far } from "@fortawesome/free-regular-svg-icons"
import { Button, Dropdown } from "react-bootstrap"
import { Container } from "./ui/layout"
import { Nav, Navbar } from "./ui/navigation"
import {
  useCallback,
  useDispatch,
  Provider,
  createStore,
  useSelector,
  useState,
  useEffect,
} from "./react_base"
import Home from "./home"
import LoginModal from "./login_modal"
import About from "./about"
import "./styles.scss"
import { apiCall as loginCall, API_ARGS as LOGIN_ARGS } from "../api/login"
import { apiCall as logoutCall } from "../api/logout"
import {
  apiCall as getLoginStatus,
  API_ARGS as LOGIN_STATUS_ARGS,
  Response as LoginStatusResponse,
} from "../api/get_login_status"
import { rootReducer, AppState } from "./reducers"
import setData from "./actions"

interface BaseProps {
  children: React.ReactElement | React.ReactElement[]
}

function Base(props: BaseProps) {
  const { children } = props

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false)

  const dispatch = useDispatch()
  const user = useSelector((state: AppState) => state.user)

  const hideLoginModal = useCallback(() => {
    setShowLoginModal(false)
  }, [setShowLoginModal])

  const onLogin = useCallback(() => {
    setShowLoginModal(true)
    /*
    loginCall(
      LOGIN_ARGS,
      (data: LoginStatusResponse) => {
        dispatch(
          setData({
            user: data,
          }),
        )
      },
      () => {},
    )
    */
  }, [dispatch])

  const onLogout = useCallback(() => {
    logoutCall(
      null,
      () => {
        dispatch(
          setData({
            user: null,
          }),
        )
      },
      () => {},
    )
  }, [dispatch])

  useEffect(() => {
    getLoginStatus(
      LOGIN_STATUS_ARGS,
      (data: LoginStatusResponse) => {
        if (data.email) {
          dispatch(
            setData({
              user: data,
            }),
          )
        }
      },
      () => {},
    )
  }, [dispatch])

  return (
    <>
      <LoginModal show={showLoginModal} onHide={hideLoginModal} />
      <Navbar bg="primary" variant="dark">
        <Container>
          <Navbar.Brand href="#home">Agora</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/about">About</Nav.Link>
            {user ? (
              <Dropdown className="login">
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                  <span>
                    <FontAwesomeIcon icon="fa-solid fa-bars" className="login-icon" />
                    {`${user.firstName} ${user.lastName}`}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item>Action</Dropdown.Item>
                  <Dropdown.Item>Another action</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={onLogout}>Log Out</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Button className="login" onClick={onLogin}>
                Log In
              </Button>
            )}
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

const store = createStore(rootReducer)

library.add(fas, far)

ReactDOM.render(
  <Provider store={store}>
    <Base>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} index />
          {Object.keys(ROUTES).map((route) => {
            const Component = ROUTES[route]
            return <Route path={route} key={route} element={<Component />} />
          })}
        </Routes>
      </Router>
    </Base>
  </Provider>,
  document.getElementById("root"),
)
