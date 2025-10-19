import React, { useState } from 'react'
import { Button, Modal } from 'react-bootstrap';

const UserDetail = ({user}) => {
    const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <div>
         <Button variant="info" onClick={handleShow}>
        Detail
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>المعطيات الشصية الخاصة بـ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        ---
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default UserDetail
