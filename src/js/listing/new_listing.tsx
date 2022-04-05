import * as React from "react"
import { Row, Col } from "react-bootstrap"
import { Button, Form, Message, Input } from "semantic-ui-react"
import Dropzone from "react-dropzone"

function Listing() {
  return <p />
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

  const canSubmit = true

  return (
    <Row>
      <Col xs="6">
        <h1 className="column-heading-centered">Create a New Listing</h1>
        <Form>
          <Row>
            <Col xs="9">
              <Form.Field
                control={Input}
                label="Listing Name"
                placeholder="Used Phys 1a Textbook"
                onChange={() => {}}
              />
            </Col>
            <Col xs="3">
              <Form.Field control={Input} label="Price" placeholder="4.99" onChange={() => {}} />
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
              />
            </Col>
            <Col xs="6">
              <Form.Dropdown
                label="Condition"
                placeholder="Select Condition"
                fluid
                selection
                options={conditions}
              />
            </Col>
          </Row>
          <br />
          <Row>
            <Dropzone onDrop={(acceptedFiles: File[]) => console.log(acceptedFiles)}>
              {({ getRootProps, getInputProps }) => (
                <div {...getRootProps()}>
                  <div className="droparea">
                    <input {...getInputProps()} />
                    <b>Drag and drop an image of the listed item, or click to upload</b>
                  </div>
                </div>
              )}
            </Dropzone>
          </Row>
          <br />
          <Row>
            <Form.TextArea
              placeholder="Enter a description of the product"
              style={{ minHeight: 100, maxHeight: 200 }}
            />
          </Row>
          <br />
          <Row>
            <Col xs="6">
              <Button type="submit" disabled={!canSubmit}>
                Finish and List
              </Button>
            </Col>
          </Row>
        </Form>
      </Col>
      <Col xs="6">
        <h1 className="column-heading-centered">Preview (Customer View)</h1>
        <Listing />
      </Col>
    </Row>
  )
}

export default ListingForm
