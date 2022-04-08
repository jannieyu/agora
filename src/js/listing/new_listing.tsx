import * as React from "react"
import { Row, Col, OverlayTrigger, Popover } from "react-bootstrap"
import { Button, Form, Input } from "semantic-ui-react"
import Dropzone from "react-dropzone"
import { useCallback, useState } from "../base/react_base"

interface ListingProps {
  category: string
  name: string
  price: string
  condition: string
  imageURL: string
  description: string
}

interface OnChangeObject {
  value: string
}

function isValidPrice(input: string) {
  const pattern = /(?=.*?\d)^\$?(([1-9]\d{0,2}(,\d{3})*)|\d+)?(\.\d{1,2})?$/
  return pattern.test(input)
}

function Listing(props: ListingProps) {
  const { category, name, price, condition, imageURL, description } = props

  return (
    <Row>
      <Col xs="12">
        <div className="listing">
          {category ? <b className="category">{`${category}/`}</b> : null}
          <div>
            {imageURL ? (
              <img src={imageURL} alt="Listing Preview" className="image-preview" />
            ) : null}
          </div>
          <div>
            <h2>{name}</h2>
            <div className="major-metadata">
              {price && isValidPrice(price) ? (
                <>
                  <b>Price:</b> <span>{price.startsWith("$") ? price : `$${price}`}</span>
                </>
              ) : null}
            </div>
            <div className="major-metadata">
              {condition ? (
                <>
                  <b>Condition:</b> <span>{condition}</span>
                </>
              ) : null}
            </div>
            <br />
            <div>
              {description ? (
                <>
                  <b className="major-metadata">Description:</b> <span>{description}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </Col>
    </Row>
  )
}

function ListingForm() {
  const categories = [
    {
      key: "Apparel",
      value: "Apparel",
      text: "Apparel",
    },
    {
      key: "Books",
      value: "Books",
      text: "Books",
    },
    {
      key: "Furniture",
      value: "Furniture",
      text: "Furniture",
    },
  ]

  const conditions = [
    {
      key: "New",
      value: "New",
      text: "New",
    },
    {
      key: "Lightly Used",
      value: "Lightly Used",
      text: "Lightly Used",
    },
    {
      key: "Well Loved",
      value: "Well Loved",
      text: "Well Loved",
    },
  ]

  const [name, setName] = useState<string>("")
  const [price, setPrice] = useState<string>("")
  const [category, setCategory] = useState<string>("")
  const [condition, setCondition] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [imageURL, setImageURL] = useState<string>("")
  const [image, setImage] = useState<File | null>(null)

  const canSubmit =
    name && price && category && condition && description && image && isValidPrice(price)

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

  const handleChangeImage = useCallback((files: File[]) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setImageURL(e.target.result as string)
    }
    reader.readAsDataURL(files[0])
    setImage(files[0])
  }, [])

  const onSubmit = useCallback(async () => {
    const formData = new FormData()
    formData.append("name", name)
    formData.append("category", category)
    formData.append("condition", condition)
    formData.append("price", price)
    formData.append("description", description)
    formData.append("image", image, image.name)

    const response = await fetch("/api/add_item", {
      method: "POST",
      body: formData,
    })
    const result = await response.json()
    console.log(result)
  }, [name, category, condition, price, description, image])

  const submitBtn = (
    <Button type="submit" disabled={!canSubmit} onClick={onSubmit} positive>
      Finish and List
    </Button>
  )

  const wrappedSubmitBtn = canSubmit ? (
    submitBtn
  ) : (
    <OverlayTrigger
      placement="right"
      trigger="hover"
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

  return (
    <>
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
                />
              </Col>
              <Col xs="3">
                <Form.Field
                  control={Input}
                  label="Price"
                  placeholder="4.99"
                  onChange={handleChangePrice}
                  error={!!price && !isValidPrice(price)}
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
            imageURL={imageURL}
          />
        </Col>
      </Row>
      <div className="footer" />
    </>
  )
}

export default ListingForm
