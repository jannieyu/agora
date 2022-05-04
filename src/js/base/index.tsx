import * as React from "react"
import * as ReactDOM from "react-dom"
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom"
import { library } from "@fortawesome/fontawesome-svg-core"
import { fas } from "@fortawesome/free-solid-svg-icons"
import { far } from "@fortawesome/free-regular-svg-icons"
import { Container, Nav, Navbar } from "react-bootstrap"
import { Button, Dropdown } from "semantic-ui-react"
import {
  useCallback,
  useDispatch,
  Provider,
  configureStore,
  useSelector,
  useState,
  useEffect,
} from "./react_base"
import Home from "./home"
import LoginModal from "./login_modal"
import About from "./about"
import UserProfile from "../users/user_profile"
import MyListings from "../listings/my_listings"
import MyBids from "../users/my_bids"
import NotificationPage from "../notifications/notification_page"
import NewListing from "../listings/new_listing"
import "./styles.scss"
import { apiCall as logoutCall } from "../api/logout"
import {
  apiCall as getLoginStatus,
  API_ARGS as LOGIN_STATUS_ARGS,
  Response as LoginStatusResponse,
} from "../api/get_login_status"
import { rootReducer, AppState, Broadcast, BroadcastType } from "./reducers"
import { setData, clearListingState, receiveNotification, updateSearchItem } from "./actions"
import Unauthorized from "./unauthorized"

interface BaseProps {
  children: React.ReactElement | React.ReactElement[]
}

// Paths that the user must be logged in to see
const LOGGED_IN_PATHS = new Set([
  "/create_listing",
  "/notifications",
  "/my_listings",
  "/my_bids",
  "/update_listing",
])

function PageNotFound() {
  return (
    <>
      <h1>404: Page Not Found</h1>
      <p>
        The page you requested does not exist. Please return to the <Link to="/">home page</Link>.
      </p>
    </>
  )
}

function Base(props: BaseProps) {
  const { children } = props

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, showLoginModal, isSignUp, numUnseenNotifs } = useSelector(
    (state: AppState) => state,
  )

  const [ws, setWs] = useState<WebSocket | null>(null)

  const requiresAuth = LOGGED_IN_PATHS.has(location.pathname)

  const hideLoginModal = useCallback(() => {
    dispatch(setData({ showLoginModal: false }))
  }, [dispatch])

  const onLogin = useCallback(() => {
    dispatch(setData({ showLoginModal: true }))

    dispatch(setData({ isSignUp: false }))
  }, [dispatch])

  const onSignUp = useCallback(() => {
    dispatch(setData({ showLoginModal: true }))

    dispatch(setData({ isSignUp: true }))
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

        if (requiresAuth) {
          navigate("/")
        }
      },
      () => {},
    )
  }, [dispatch, navigate, requiresAuth])

  const onCreateListing = useCallback(() => {
    dispatch(clearListingState())
    navigate("create_listing")
  }, [dispatch, navigate])

  const onClickMyProfile = useCallback(() => {
    navigate(`user_profile/?id=${user.id}`)
  }, [navigate, user])

  const onClickMyListings = useCallback(() => {
    navigate("my_listings")
  }, [navigate])

  const onClickMyBids = useCallback(() => {
    navigate("my_bids")
  }, [navigate])

  const onClickNotifications = useCallback(() => {
    navigate(`notifications`)
  }, [navigate])

  useEffect(() => {
    getLoginStatus(
      LOGIN_STATUS_ARGS,
      (data: LoginStatusResponse) => {
        if (data.email) {
          dispatch(
            setData({
              user: {
                id: data.id,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
              },
              numUnseenNotifs: data.newNotificationCount,
            }),
          )
        }
        setWs(new WebSocket("ws://localhost:8000/api/ws"))
      },
      () => {},
    )
  }, [dispatch])

  useEffect(() => {
    if (ws) {
      ws.onopen = () => {}

      ws.onmessage = (evt) => {
        // listen to data sent from the websocket server
        const message: Broadcast = JSON.parse(evt.data)
        if (message.broadcastType === BroadcastType.NEW_NOTIFICATION) {
          dispatch(receiveNotification())
        } else if (message.broadcastType === BroadcastType.NEW_BID) {
          dispatch(updateSearchItem({}, message.data.itemId, message.data))
        }
      }

      ws.onclose = () => {}
    }
  }, [ws, dispatch])

  const notifStrLen = numUnseenNotifs.toString().length
  const topNotifBubbleWidth = `${notifStrLen * 0.15 + 0.9}rem`
  const bottomNotifBubbleWidth = `${notifStrLen * 0.2 + 1.2}rem`

  return (
    <>
      <LoginModal show={showLoginModal} onHide={hideLoginModal} isSignUp={isSignUp} />
      <Navbar bg="primary" variant="dark">
        <Container>
          <Navbar.Brand>
            <Link to="/" className="unstyled-link">
              Agora
            </Link>
          </Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Item className="nav-link">
              <Link to="/about" className="unstyled-link">
                About
              </Link>
            </Nav.Item>
            <div className="login">
              {user ? (
                <Dropdown
                  icon="bars"
                  floating
                  labeled
                  button
                  className="icon"
                  trigger={
                    <div className="name-trigger">
                      <span
                        style={
                          numUnseenNotifs ? { marginRight: `${(notifStrLen - 1) * 0.2}rem` } : null
                        }
                      >{`${user.firstName} ${user.lastName}`}</span>
                      {numUnseenNotifs > 0 ? (
                        <div
                          className="res-circle"
                          style={{
                            width: topNotifBubbleWidth,
                          }}
                        >
                          <div className="circle-txt">{numUnseenNotifs}</div>
                        </div>
                      ) : null}
                    </div>
                  }
                >
                  <Dropdown.Menu>
                    <Dropdown.Item text="My Bids" onClick={onClickMyBids} />
                    <Dropdown.Item onClick={onClickNotifications}>
                      <div className="notif-dropdown">
                        Notifications{" "}
                        {numUnseenNotifs > 0 ? (
                          <div
                            className="res-circle"
                            style={{
                              width: bottomNotifBubbleWidth,
                            }}
                          >
                            <div className="circle-txt">{numUnseenNotifs}</div>
                          </div>
                        ) : null}
                      </div>
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item text="Create Listing" onClick={onCreateListing} />
                    <Dropdown.Item text="My Listings" onClick={onClickMyListings} />
                    <Dropdown.Divider />
                    <Dropdown.Item text="Account" onClick={onClickMyProfile} />
                    <Dropdown.Item onClick={onLogout} text="Log Out" />
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <>
                  <Button onClick={onLogin} color="green">
                    Log In
                  </Button>
                  <Button onClick={onSignUp} color="orange">
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </Nav>
        </Container>
      </Navbar>
      <Container>
        <div className="content-base">
          {requiresAuth && !user ? <Unauthorized loggedIn={!!user} /> : children}
        </div>
      </Container>
    </>
  )
}

const ROUTES = {
  about: About,
  create_listing: NewListing,
  update_listing: NewListing,
  user_profile: UserProfile,
  notifications: NotificationPage,
  my_listings: MyListings,
  my_bids: MyBids,
}

const store = configureStore({ reducer: rootReducer })

library.add(fas, far)

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Base>
        <Routes>
          <Route path="/">
            <Route index element={<Home />} />
            {Object.keys(ROUTES).map((route) => {
              const Component = ROUTES[route]
              return <Route path={route} key={route} element={<Component />} />
            })}
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Base>
    </Router>
  </Provider>,
  document.getElementById("root"),
)
