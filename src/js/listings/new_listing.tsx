import * as React from "react"
import { Row, Col, OverlayTrigger, Modal, Popover } from "react-bootstrap"
import { useNavigate } from "react-router"
import { Button, Form, Input } from "semantic-ui-react"
import Dropzone from "react-dropzone"
import { useCallback, useState } from "../base/react_base"
import { conditions, categories } from "./constants"
import Listing, { isValidPrice } from "./listing"

interface OnChangeObject {
  value: string
}

interface SubmissionModalProps {
  onHide: () => void
  show: boolean
  wasSuccess: boolean
}

function SubmissionModal(props: SubmissionModalProps) {
  const { onHide, show, wasSuccess } = props
  const navigate = useNavigate()

  const returnHome = () => navigate("/")

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {wasSuccess ? "Success!" : "Error"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col xs="12" align="center">
            {wasSuccess
              ? "Your listing was created successfully! Create another listing or return home."
              : "There was an error creating your listing. We are very sorry for the inconvenience. Please consider trying again or returning home."}
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>{wasSuccess ? "Create Another Listing" : "Try Again"}</Button>
        <Button onClick={returnHome}>Return Home</Button>
      </Modal.Footer>
    </Modal>
  )
}

function ListingForm() {
  const [name, setName] = useState<string>("")
  const [price, setPrice] = useState<string>("")
  const [category, setCategory] = useState<string>("")
  const [condition, setCondition] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [imageURL, setImageURL] = useState<string>("")
  const [image, setImage] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false)
  const [showFailureModal, setShowFailureModal] = useState<boolean>(false)
  const [imageError, setImageError] = useState<boolean>(false)

  const canSubmit =
    name &&
    price &&
    category &&
    condition &&
    description &&
    image &&
    isValidPrice(price) &&
    !imageError

  const handleChangeName = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setName(e.currentTarget.value)
  }, [])

  const handleChangePrice = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setPrice(e.currentTarget.value)
  }, [])

  const handleChangeCategory = useCallback(
    (e: React.FormEvent<HTMLInputElement>, data: OnChangeObject) => {
      setCategory(data.value)
    },
    [],
  )

  const handleChangeCondition = useCallback(
    (e: React.FormEvent<HTMLInputElement>, data: OnChangeObject) => {
      setCondition(data.value)
    },
    [],
  )

  const handleChangeDescription = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>, data: OnChangeObject) => {
      setDescription(data.value)
    },
    [],
  )

  const reset = () => {
    setName("")
    setPrice("")
    setCategory("")
    setCondition("")
    setDescription("")
    setImageURL("")
    setImage(null)
    setSubmitting(false)
    setShowSuccessModal(false)
    setShowFailureModal(false)
  }

  const handleChangeImage = useCallback((files: File[]) => {
    const imageFile = files[0]
    if (
      imageFile.name.endsWith(".png") ||
      imageFile.name.endsWith(".jpg") ||
      imageFile.name.endsWith(".gif")
    ) {
      setImageError(false)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImageURL(e.target.result as string)
      }
      reader.readAsDataURL(imageFile)
      setImage(imageFile)
    } else {
      setImageError(true)
      setImage(null)
      setImageURL("")
    }
  }, [])

  const onSubmit = useCallback(async () => {
    const formData = new FormData()
    formData.append("name", name)
    formData.append("category", category)
    formData.append("condition", condition)
    formData.append("price", price)
    formData.append("description", description)
    formData.append("image", image, image.name)

    setSubmitting(true)
    const response = await fetch("/api/add_item", {
      method: "POST",
      body: formData,
    })
    if (response.status === 201) {
      setSubmitting(false)
      setShowSuccessModal(true)
      setShowFailureModal(false)
    } else {
      setSubmitting(false)
      setShowSuccessModal(false)
      setShowFailureModal(true)
    }
  }, [name, category, condition, price, description, image])

  const submitBtn = (
    <Button type="submit" disabled={!canSubmit} loading={submitting} onClick={onSubmit} positive>
      Finish and List
    </Button>
  )

  const wrappedSubmitBtn = canSubmit ? (
    submitBtn
  ) : (
    <OverlayTrigger
      placement="right"
      trigger={["hover", "focus"]}
      overlay={
        <Popover>
          <Popover.Body>
            All form fields must be filled without error and an image must be included to submit.
          </Popover.Body>
        </Popover>
      }
    >
      <span>{submitBtn}</span>
    </OverlayTrigger>
  )

  const dropzoneAreaMessage = imageError
    ? "Error uploading image: file type not supported"
    : "Drag and drop an image of the listed item, or click to upload"
  const dropzoneAreaClass = imageError ? "droparea-error" : "droparea-text"

  return (
    <>
      <SubmissionModal
        onHide={reset}
        show={showSuccessModal || showFailureModal}
        wasSuccess={showSuccessModal}
      />
      <Row>
        <Col xs="6">
          <h1 className="column-heading-centered">Enter Listing Details</h1>
          <br />
          <Form>
            <Row>
              <Col xs="9">
                <Form.Field
                  control={Input}
                  label="Listing Name"
                  placeholder="Used Phys 1a Textbook"
                  onChange={handleChangeName}
                  value={name}
                />
              </Col>
              <Col xs="3">
                <Form.Field
                  control={Input}
                  label="Price"
                  placeholder="4.99"
                  onChange={handleChangePrice}
                  error={!!price && !isValidPrice(price)}
                  value={price}
                />
              </Col>
            </Row>
            <br />
            <Row>
              <Col xs="6">
                <Form.Dropdown
                  label="Category"
                  placeholder="Select Category"
                  fluid
                  selection
                  options={categories}
                  onChange={handleChangeCategory}
                  value={category}
                />
              </Col>
              <Col xs="6">
                <Form.Dropdown
                  label="Condition"
                  placeholder="Select Condition"
                  fluid
                  selection
                  options={conditions}
                  onChange={handleChangeCondition}
                  value={condition}
                />
              </Col>
            </Row>
            <br />
            <Row>
              <Dropzone onDrop={handleChangeImage}>
                {({ getRootProps, getInputProps }) => (
                  <div {...getRootProps()}>
                    <div className="droparea">
                      <input {...getInputProps()} />
                      <b className={dropzoneAreaClass}>{image?.name || dropzoneAreaMessage}</b>
                    </div>
                  </div>
                )}
              </Dropzone>
            </Row>
            <br />
            <Row>
              <Form.TextArea
                placeholder="Enter a description of the product"
                style={{ minHeight: 100, maxHeight: 400 }}
                onChange={handleChangeDescription}
                value={description}
              />
            </Row>
            <br />
            <Row>
              <Col xs="6">{wrappedSubmitBtn}</Col>
            </Row>
          </Form>
        </Col>
        <Col xs="6">
          <h1 className="column-heading-centered">Preview (Buyer View)</h1>
          <br />
          <Listing
            name={name}
            price={price}
            condition={condition}
            description={description}
            category={category}
            image={imageURL}
            id={0}
          />
        </Col>
      </Row>
      <div className="footer" />
    </>
  )
}

export default ListingForm
