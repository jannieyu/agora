import * as React from "react"
import { Container, Nav, Navbar } from "react-bootstrap"
import { Button, Dropdown } from "semantic-ui-react"
import { Link, useNavigate } from "react-router-dom"
import { DateTime } from "luxon"
import { apiCall as logoutCall } from "../api/logout"
import { useCallback, useDispatch, useSelector } from "./react_base"
import { clearListingState, setData } from "./actions"
import { AppState, User } from "./reducers"
import Countdown from "./countdown"

interface SiteNavbarProps {
  user: User
  requiresAuth: boolean
}

function SiteNavbar(props: SiteNavbarProps) {
  const { user, requiresAuth } = props
  const numUnseenNotifs = useSelector((state: AppState) => state.numUnseenNotifs)
  const auctionEnd = DateTime.now().plus({ seconds: 10 })

  const dispatch = useDispatch()
  const navigate = useNavigate()

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

  const notifStrLen = numUnseenNotifs.toString().length
  const topNotifBubbleWidth = `${notifStrLen * 0.15 + 0.9}rem`
  const bottomNotifBubbleWidth = `${notifStrLen * 0.2 + 1.2}rem`

  return (
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
            <Nav.Item className="nav-link nav-countdown">
              <Countdown endTime={auctionEnd} />
            </Nav.Item>
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
  )
}

export default SiteNavbar
