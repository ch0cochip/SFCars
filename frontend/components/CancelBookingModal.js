"use client";

import { Button, Modal, Label } from "flowbite-react";
import PropTypes from "prop-types";
import { useUser } from "@contexts/UserProvider";

const CancelBookingModal = ({
  showCancelBookingModal,
  setShowCancelBookingModal,
  booking,
}) => {
  const { fetchUser } = useUser();

  const handleCancelBooking = async () => {
    const body = {
      start_time: booking.start_time,
      end_time: booking.end_time,
      type: "single",
    };
    const response = await fetch(`/bookings/${booking._id}`, "DELETE", body);
    if (response.error) {
      throw new Error(response.error);
    } else {
      fetchUser();
      setShowCancelBookingModal(false);
    }
  };

  return (
    <div>
      <Button
        className="bg-custom-orange hover:bg-custom-orange-dark text-white"
        onClick={() => setShowCancelBookingModal(true)}
      >
        Cancel Booking
      </Button>
      <Modal
        show={showCancelBookingModal}
        onClose={() => setShowCancelBookingModal(false)}
      >
        <Modal.Header className="bg-custom-orange text-white">
          Cancel Booking
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col space-y-4">
            <Label className="text-gray-700">
              Are you sure you want to cancel this booking?
            </Label>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex flex-row justify-end space-x-4">
            <Button
              className="bg-custom-orange hover:bg-custom-orange-dark text-white"
              onClick={() => setShowCancelBookingModal(false)}
            >
              Close
            </Button>
            <Button
              className="bg-custom-orange hover:bg-custom-orange-dark text-white"
              onClick={handleCancelBooking}
            >
              Cancel Booking
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CancelBookingModal;

CancelBookingModal.propTypes = {
  showCancelBookingModal: PropTypes.bool.isRequired,
  setShowCancelBookingModal: PropTypes.func.isRequired,
  booking: PropTypes.object.isRequired,
};
