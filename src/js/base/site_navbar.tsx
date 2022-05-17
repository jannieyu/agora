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
import { AuctionState } from "./types"

interface SiteNavbarProps {
  user: User
  requiresAuth: boolean
}

const AUCTION_COMPLETE_TEXT = <span>Auction{"\u00A0"}Complete</span>

function SiteNavbar(props: SiteNavbarProps) {
  const { user, requiresAuth } = props
  const { auction, numUnseenNotifs } = useSelector((state: AppState) => state)

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

  let endTime = null
  if (auction?.id) {
    if (DateTime.now() < DateTime.fromISO(auction.startTime)) {
      endTime = DateTime.fromISO(auction.startTime)
    } else {
      endTime = DateTime.fromISO(auction.endTime)
    }
  }

  const auctionState = auction?.state

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "white" }}>
      <Navbar className="site-navbar">
        <Container className="site-navbar-container">
          <Navbar.Brand>
            <Link to="/" className="unstyled-link">
              <img src="/images/assets/auctionhouse_logo.png" alt="logo" />
            </Link>
          </Navbar.Brand>
          <Nav>
            <Nav.Item className="nav-link nav-countdown">
              {[AuctionState.ACTIVE, AuctionState.NOT_STARTED].includes(auction?.state) && (
                <Countdown endTime={endTime} showClock />
              )}
              {auctionState === AuctionState.COMPLETE && AUCTION_COMPLETE_TEXT}
            </Nav.Item>
            <div>
              {user ? (
                <Dropdown
                  icon="bars"
                  floating
                  labeled
                  basic
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
    </div>
  )
}

export default SiteNavbar
