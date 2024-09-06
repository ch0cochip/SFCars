"use client";

import { Button, Modal } from "flowbite-react";
import PropTypes from "prop-types";
import { useUser } from "@contexts/UserProvider";
import { useState, useRef, useEffect } from "react";
import { makeRequest } from "@utils/utils";

const ReviewModal = ({ showReviewModal, setShowReviewModal, booking }) => {
  const { fetchUser } = useUser();
  const [review, setReview] = useState("");
  const [rating, setRating] = useState("");

  const ref = useRef(null);

  useEffect(() => {
    ref.current = document.body;
  }, []);

  const handleReview = async () => {
    const body = {
      rating: parseInt(rating),
      message: review,
    };
    console.log(booking);
    const response = await makeRequest(
      `/bookings/${booking._id}/review`,
      "POST",
      body
    );
    if (response.error) {
      throw new Error(response.error);
    } else {
      fetchUser();
      setShowReviewModal(false);
    }
  };

  return (
    <div>
      <Button
        className="bg-custom-orange hover:bg-custom-orange-dark text-white"
        onClick={() => setShowReviewModal(true)}
      >
        Leave a Review
      </Button>
      <Modal
        show={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        root={ref.current}
      >
        <Modal.Header className="bg-custom-orange text-white">
          Leave a Review
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col space-y-4">
            <div>
              <h3 className="font-bold text-sm text-gray-500 mb-1">Review</h3>
              <input
                type="text"
                placeholder="Review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2"
              />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-500 mb-1">Rating</h3>
              <input
                type="text"
                placeholder="Rating"
                value={rating}
                onChange={(e) => {
                  const val = e.target.value;
                  if (
                    val === "" ||
                    (/^\d*$/.test(val) &&
                      parseInt(val) <= 5 &&
                      parseInt(val) >= 0)
                  ) {
                    setRating(val);
                  }
                }}
                maxLength={1}
                className="w-full border border-gray-300 rounded-md px-4 py-2"
              />
              <p className="text-sm text-gray-500">
                Rating must be between 0 and 5
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex flex-row justify-end space-x-4">
            <Button
              className="bg-custom-orange hover:bg-custom-orange-dark text-white"
              onClick={() => setShowReviewModal(false)}
            >
              Close
            </Button>
            <Button
              className="bg-custom-orange hover:bg-custom-orange-dark text-white"
              onClick={handleReview}
            >
              Leave Review
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReviewModal;

ReviewModal.propTypes = {
  showReviewModal: PropTypes.bool.isRequired,
  setShowReviewModal: PropTypes.func.isRequired,
  booking: PropTypes.object.isRequired,
};
