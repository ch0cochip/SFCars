"use client";

import { Button, Modal, Label } from "flowbite-react";
import PropTypes from "prop-types";

const ConfirmListingBookingModal = ({
  showConfirmListingBookingModal,
  setShowConfirmListingBookingModal,
}) => {
  return (
    <div>
      <Modal
        show={showConfirmListingBookingModal}
        onClose={() => setShowConfirmListingBookingModal(false)}
      >
        <Modal.Header className="bg-custom-orange text-white">
          Booking Confirmation
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col space-y-4">
            <Label className="text-gray-700">
              Your booking has been confirmed!
            </Label>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex flex-row justify-end space-x-4">
            <Button
              className="bg-custom-orange hover:bg-custom-orange-dark text-white"
              onClick={() => setShowConfirmListingBookingModal(false)}
            >
              Close
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ConfirmListingBookingModal;

ConfirmListingBookingModal.propTypes = {
  showConfirmListingBookingModal: PropTypes.bool.isRequired,
  setShowConfirmListingBookingModal: PropTypes.func.isRequired,
};
