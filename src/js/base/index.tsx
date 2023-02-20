import * as React from "react"
import * as ReactDOM from "react-dom/client"
import { BrowserRouter as Router, Route, Routes, useLocation, Link } from "react-router-dom"
import { library } from "@fortawesome/fontawesome-svg-core"
import { fas } from "@fortawesome/free-solid-svg-icons"
import { far } from "@fortawesome/free-regular-svg-icons"
import { Container } from "react-bootstrap"
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
import {
  apiCall as getLoginStatus,
  API_ARGS as LOGIN_STATUS_ARGS,
  Response as LoginStatusResponse,
} from "../api/get_login_status"
import { rootReducer, AppState, Broadcast, BroadcastType, BidHistory } from "./reducers"
import { setData, receiveNotification, updateSearchItem } from "./actions"
import { determineAuctionState } from "./util"
import Unauthorized from "./unauthorized"
import SiteNavbar from "./site_navbar"

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
  const location = useLocation()
  const { user, showLoginModal, isSignUp } = useSelector((state: AppState) => state)

  const [ws, setWs] = useState<WebSocket | null>(null)

  const requiresAuth = LOGGED_IN_PATHS.has(location.pathname)

  const hideLoginModal = useCallback(() => {
    dispatch(setData({ showLoginModal: false }))
  }, [dispatch])

  useEffect(() => {
    getLoginStatus(
      LOGIN_STATUS_ARGS,
      (data: LoginStatusResponse) => {
        dispatch(
          setData({
            user: data.email
              ? {
                  id: data.id,
                  email: data.email,
                  firstName: data.firstName,
                  lastName: data.lastName,
                }
              : null,
            numUnseenNotifs: data.newNotificationCount,
            auction: { ...data.auction, state: determineAuctionState(data.auction) },
          }),
        )
        setWs(new WebSocket(`ws://${window.location.hostname}:8000/api/ws`))
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
          const newBid = message.data as BidHistory
          dispatch(updateSearchItem({}, newBid.itemId, newBid))
        } else if (message.broadcastType === BroadcastType.UPDATE_ITEM) {
          dispatch(updateSearchItem(message.data, message.data.id))
        }
      }

      ws.onclose = () => {}
    }
  }, [ws, dispatch])

  return (
    <>
      <SiteNavbar user={user} requiresAuth={requiresAuth} />
      <LoginModal show={showLoginModal} onHide={hideLoginModal} isSignUp={isSignUp} />
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

const container = document.getElementById("root")

// Create a root.
const root = ReactDOM.createRoot(container)

root.render(
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
)
