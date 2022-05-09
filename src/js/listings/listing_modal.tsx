import * as React from "react"
import { Modal } from "react-bootstrap"
import { useCallback, useSelector } from "../base/react_base"
import Listing from "./listing"
import { ListingProps } from "./types"
import { AppState } from "../base/reducers"

interface ModalProps {
  onHide: () => void
  show: boolean
  selectedItem: ListingProps
  redirectHome?: boolean
}

export default function ListingModal(props: ModalProps) {
  const { onHide, show, selectedItem, redirectHome } = props

  const showingLoginModal = useSelector((state: AppState) => state.showLoginModal)

  const hideAndReset = useCallback(() => {
    onHide()
  }, [onHide])

  return (
    <Modal
      show={show && !showingLoginModal}
      onHide={hideAndReset}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">View Listing</Modal.Title>
      </Modal.Header>
      <Listing {...selectedItem} redirectHome={redirectHome} showRecommendations />
    </Modal>
  )
}

ListingModal.defaultProps = {
  redirectHome: false,
}
