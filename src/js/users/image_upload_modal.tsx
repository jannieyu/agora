import * as React from "react"
import { Modal } from "react-bootstrap"

interface ImageUploadModalProps {
  show: boolean
  onHide: () => void
}

export default function ImageUploadModal(props: ImageUploadModalProps) {
  const { show, onHide } = props

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Upload Image</Modal.Title>
      </Modal.Header>
      <Modal.Body>IMAGE UPLOAD HERE</Modal.Body>
    </Modal>
  )
}
