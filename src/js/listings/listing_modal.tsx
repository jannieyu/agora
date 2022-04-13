import * as React from "react"
import { Modal } from "react-bootstrap"
import { useCallback } from "../base/react_base"
import Listing from "./listing"
import { ListingProps } from "./types"

interface ModalProps {
  onHide: () => void
  show: boolean
  selectedItem: ListingProps
}

export default function ListingModal(props: ModalProps) {
  const { onHide, show, selectedItem } = props

  const hideAndReset = useCallback(() => {
    onHide()
  }, [onHide])

  return (
    <Modal
      show={show}
      onHide={hideAndReset}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">View Listing</Modal.Title>
      </Modal.Header>
      <Listing {...selectedItem} />
    </Modal>
  )
}
