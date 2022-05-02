import * as React from "react"
import { Row, Col, OverlayTrigger, Modal, Popover } from "react-bootstrap"
import { useNavigate } from "react-router"
import { useSearchParams } from "react-router-dom"
import { Button, Form, Input } from "semantic-ui-react"
import { DateTime } from "luxon"
import Dropzone from "react-dropzone"
import {
  useCallback,
  useDispatch,
  useEffect,
  useMemo,
  useSelector,
  useState,
} from "../base/react_base"
import { AppState } from "../base/reducers"
import { updateListingState } from "../base/actions"
import { conditions, categories } from "./constants"
import Listing from "./listing"
import { isValidPrice } from "./util"
import { OnChangeObject } from "../base/types"
import { safeParseInt } from "../base/util"
import { apiCall as getItem, Response as GetItemResponse } from "../api/get_item"
import DollarInput from "./dollar_input"
import Unauthorized from "../base/unauthorized"

interface SubmissionModalProps {
  onHide: () => void
  show: boolean
  wasSuccess: boolean
  clearState: () => void
  id: string
  fetchItem: () => void
}

function SubmissionModal(props: SubmissionModalProps) {
  const { onHide, show, wasSuccess, clearState, id, fetchItem } = props
  const navigate = useNavigate()

  const returnHome = () => {
    clearState()
    navigate("/")
  }

  const goAgain = useCallback(() => {
    clearState()
    if (wasSuccess) {
      navigate("/create_listing")
    } else if (id) {
      fetchItem()
    }
  }, [clearState, navigate, wasSuccess, id, fetchItem])

  const successMessage = `Your listing was ${id ? "updated" : "created"} successfully! Create ${
    id ? "a new" : "another"
  } listing or return home.`

  const createMessage = `Create ${id ? "a new" : "another"} Listing`

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
              ? successMessage
              : "There was an error creating your listing. We are very sorry for the inconvenience. Please consider trying again or returning home."}
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={goAgain}>{wasSuccess ? createMessage : "Try Again"}</Button>
        <Button onClick={returnHome}>Return Home</Button>
      </Modal.Footer>
    </Modal>
  )
}

function ListingForm() {
  const { user, listingState } = useSelector((state: AppState) => state)

  const {
    name,
    startingPrice,
    category,
    condition,
    description,
    imageURL,
    bids,
    highestBid,
    sellerId,
  } = listingState

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [image, setImage] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false)
  const [showFailureModal, setShowFailureModal] = useState<boolean>(false)

  const [searchParams] = useSearchParams()
  const params = useMemo(() => Object.fromEntries([...searchParams]), [searchParams])
  const { id } = params

  const fetchItem = useCallback(() => {
    getItem(
      {
        itemId: safeParseInt(id),
      },
      (items: GetItemResponse) => {
        const item = items[0]
        dispatch(
          updateListingState({
            name: item.name,
            startingPrice: item.price,
            condition: item.condition,
            category: item.category,
            imageURL: item.image,
            description: item.description,
            bids: item.bids,
            highestBid: item.highestBid,
            sellerId: item.sellerId,
          }),
        )
      },
      () => {
        navigate("/")
      },
    )
  }, [id, dispatch, navigate])

  useEffect(() => {
    if (id) {
      fetchItem()
    }
  }, [dispatch, id, navigate, fetchItem])

  const canSubmit =
    name &&
    startingPrice &&
    category &&
    condition &&
    description &&
    imageURL &&
    isValidPrice(startingPrice)

  const handleChangeName = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      dispatch(updateListingState({ name: e.currentTarget.value }))
    },
    [dispatch],
  )

  const handleChangeStartingPrice = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      dispatch(updateListingState({ startingPrice: e.currentTarget.value }))
    },
    [dispatch],
  )

  const handleChangeCategory = useCallback(
    (e: React.FormEvent<HTMLInputElement>, data: OnChangeObject) => {
      dispatch(updateListingState({ category: data.value }))
    },
    [dispatch],
  )

  const handleChangeCondition = useCallback(
    (e: React.FormEvent<HTMLInputElement>, data: OnChangeObject) => {
      dispatch(updateListingState({ condition: data.value }))
    },
    [dispatch],
  )

  const handleChangeDescription = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>, data: OnChangeObject) => {
      dispatch(updateListingState({ description: data.value }))
    },
    [dispatch],
  )

  const reset = () => {
    dispatch(
      updateListingState({
        name: "",
        condition: "",
        category: "",
        description: "",
        imageURL: "",
        startingPrice: "",
        bids: [],
        highestBid: "",
      }),
    )
    setImage(null)
    setSubmitting(false)
    setShowSuccessModal(false)
    setShowFailureModal(false)
  }

  const handleChangeImage = useCallback(
    (files: File[]) => {
      const imageFile = files[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        dispatch(updateListingState({ imageURL: e.target.result as string }))
      }
      reader.readAsDataURL(imageFile)
      setImage(imageFile)
    },
    [dispatch],
  )

  const onSubmit = useCallback(async () => {
    const formData = new FormData()
    formData.append("name", name)
    formData.append("category", category)
    formData.append("condition", condition)
    formData.append("description", description)
    if (image) {
      formData.append("image", image, image.name)
    }
    if (id) {
      formData.append("id", id)
    }
    if (bids?.length === 0 || !id) {
      formData.append("price", startingPrice)
    }

    setSubmitting(true)
    const response = await fetch("/api/add_item", {
      method: "POST",
      body: formData,
    })
    if (response.ok) {
      setSubmitting(false)
      setShowSuccessModal(true)
      setShowFailureModal(false)
    } else {
      setSubmitting(false)
      setShowSuccessModal(false)
      setShowFailureModal(true)
    }
  }, [name, category, condition, startingPrice, description, image, id, bids?.length])

  const submitBtn = (
    <Button type="submit" disabled={!canSubmit} loading={submitting} onClick={onSubmit} positive>
      {id ? "Update Item" : "Finish and List"}
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

  const canChangeStartingPrice = !id || bids?.length === 0

  const startingPriceDropdown = (
    <Form.Field
      control={DollarInput}
      label="Starting Price"
      placeholder="4.99"
      onChange={handleChangeStartingPrice}
      error={!!startingPrice && !isValidPrice(startingPrice)}
      value={startingPrice || ""}
      disabled={!canChangeStartingPrice}
    />
  )

  const wrappedStartingPriceDropdown = canChangeStartingPrice ? (
    startingPriceDropdown
  ) : (
    <OverlayTrigger
      placement="top"
      trigger={["hover", "focus"]}
      overlay={
        <Popover>
          <Popover.Body>
            The starting price cannot be modified once a bid has been placed.
          </Popover.Body>
        </Popover>
      }
    >
      <span>{startingPriceDropdown}</span>
    </OverlayTrigger>
  )

  const currTime = DateTime.now().toISO()

  if (sellerId && sellerId !== user?.id) {
    return <Unauthorized loggedIn={!!user} />
  }

  return (
    <>
      <SubmissionModal
        onHide={reset}
        show={showSuccessModal || showFailureModal}
        wasSuccess={showSuccessModal}
        clearState={reset}
        id={id}
        fetchItem={fetchItem}
      />
      <Row>
        <Col xs="6">
          <h1 className="text-centered">Enter Listing Details</h1>
          <br />
          <Form>
            <Row>
              <Col xs="6">
                <Form.Field
                  control={Input}
                  label="Listing Name"
                  placeholder="Used Phys 1a Textbook"
                  onChange={handleChangeName}
                  value={name || ""}
                />
              </Col>
              <Col xs="6">{wrappedStartingPriceDropdown}</Col>
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
                  value={category || ""}
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
                  value={condition || ""}
                />
              </Col>
            </Row>
            <br />
            <Row>
              <Dropzone
                onDrop={handleChangeImage}
                accept={{ "image/*": [".jpeg", ".png", ".gif"] }}
              >
                {({ getRootProps, getInputProps }) => (
                  <div {...getRootProps()}>
                    <div className="droparea-listing">
                      <input {...getInputProps()} />
                      <b className="droparea-text">
                        {image?.name ||
                          "Drag and drop an image of the listed item, or click to upload"}
                      </b>
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
                value={description || ""}
              />
            </Row>
            <br />
            <Row>
              <Col xs="6">{wrappedSubmitBtn}</Col>
            </Row>
          </Form>
        </Col>
        <Col xs="6">
          <h1 className="text-centered">Preview (Buyer View)</h1>
          <br />
          <Listing
            name={name}
            highestBid={highestBid || startingPrice}
            price={startingPrice}
            condition={condition}
            description={description}
            numBids={0}
            category={category}
            image={imageURL}
            seller={user}
            id={0}
            createdAt={currTime}
            bids={bids || []}
            isLocal={!!image}
            active
          />
        </Col>
      </Row>
      <div className="footer" />
    </>
  )
}

export default ListingForm
