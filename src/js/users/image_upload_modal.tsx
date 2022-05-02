import * as React from "react"
import { Row, Col, Modal } from "react-bootstrap"
import { Button } from "semantic-ui-react"
import Dropzone from "react-dropzone"
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from "react-image-crop"
import { useCallback, useRef, useState } from "../base/react_base"
import useDebounceEffect from "./use_debounce_effect"
import getCroppedImg from "./get_cropped_image"

import "react-image-crop/dist/ReactCrop.css"

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

interface ImageUploadModalProps {
  show: boolean
  onHide: () => void
  onSuccess: () => void
  initialImageURL: string
}

export default function ImageUploadModal(props: ImageUploadModalProps) {
  const { show, onHide, onSuccess, initialImageURL } = props

  const imgRef = useRef<HTMLImageElement>(null)
  const [image, setImage] = useState<File | null>(null)
  const [imageURL, setImageURL] = useState<string>("")
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [croppedImage, setCroppedImage] = useState<Blob | null>(null)
  const [submitting, setSubmitting] = useState<boolean>(false)

  const hideAndReset = useCallback(() => {
    setImage(null)
    setCroppedImage(null)
    setCompletedCrop(null)
    setCrop(null)
    setImageURL("")
    setSubmitting(false)
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

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    const newCrop = centerAspectCrop(width, height, 1)
    setCrop(newCrop)
    getCroppedImg(imageURL || initialImageURL, newCrop).then((res: Blob) => {
      // If we want a preview URL:
      // const blobUrl = URL.createObjectURL(res)
      setCroppedImage(res)
    })
  }

  useDebounceEffect(
    async () => {
      if (completedCrop) {
        getCroppedImg(imageURL || `/${initialImageURL}`, crop).then((res: Blob) => {
          // If we want a preview URL:
          // const blobUrl = URL.createObjectURL(res)
          setCroppedImage(res)
        })
      }
    },
    100,
    [completedCrop],
  )

  const onSubmit = useCallback(async () => {
    const formData = new FormData()
    formData.append("hasImage", "true")
    formData.append("image", croppedImage, image?.name || "cropped.jpg")

    setSubmitting(true)
    const response = await fetch("/api/update_user", {
      method: "POST",
      body: formData,
    })
    if (response.ok) {
      onSuccess()
      hideAndReset()
    } else {
      // TODO: set error state
    }
  }, [croppedImage, image?.name, onSuccess, hideAndReset])

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
                <div className="droparea-user">
                  <input {...getInputProps()} />
                  <b className="droparea-text">
                    {image?.name || "Drag and drop a profile picture, or click to upload"}
                  </b>
                </div>
              </div>
            )}
          </Dropzone>
        </Row>
        <br />
        <Row className="align-items-center">
          <Col xs={3} />
          <Col align="center" xs={6}>
            {(imageURL || initialImageURL) && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  src={imageURL || `/${initialImageURL}`}
                  alt="User Profile"
                  onLoad={onImageLoad}
                  ref={imgRef}
                />
              </ReactCrop>
            )}
          </Col>
          <Col xs={3} />
        </Row>
        <br />
        <Row>
          {croppedImage && (
            <Col xs={6}>
              <Button loading={submitting} onClick={onSubmit} type="submit" positive>
                Update Image
              </Button>
            </Col>
          )}
        </Row>
      </Modal.Body>
    </Modal>
  )
}
