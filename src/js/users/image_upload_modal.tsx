import * as React from "react"
import { Row, Modal } from "react-bootstrap"
import Dropzone from "react-dropzone"
import { useCallback, useState } from "../base/react_base"

interface ImageUploadModalProps {
  show: boolean
  onHide: () => void
}

export default function ImageUploadModal(props: ImageUploadModalProps) {
  const { show, onHide } = props

  const [image, setImage] = useState<File | null>(null)
  const [imageURL, setImageURL] = useState<string>("")

  const hideAndReset = useCallback(() => {
    setImage(null)
    setImageURL("")
    onHide()
  }, [onHide])

  const handleChangeImage = useCallback((files: File[]) => {
    const imageFile = files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      setImageURL(e.target.result as string)
    }
    reader.readAsDataURL(imageFile)
    setImage(imageFile)
  }, [])

  return (
    <Modal
      show={show}
      onHide={hideAndReset}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Upload Image</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Dropzone onDrop={handleChangeImage} accept={{ "image/*": [".jpeg", ".png", ".gif"] }}>
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps()}>
                <div className="droparea">
                  <input {...getInputProps()} />
                  <b className="droparea-text">
                    {image?.name || "Drag and drop an image of the listed item, or click to upload"}
                  </b>
                </div>
              </div>
            )}
          </Dropzone>
        </Row>
        <Row>{image && <img src={imageURL} alt="User Profile" />}</Row>
      </Modal.Body>
    </Modal>
  )
}
