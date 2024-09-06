"use client";

import { Button, Modal } from "flowbite-react";
import PropTypes from "prop-types";
import TimePicker from "@components/TimePicker";
import { useState, useEffect } from "react";
import { getNextHour, makeRequest } from "@utils/utils";
import { useUser } from "@contexts/UserProvider";

const EditBookingModal = ({
  showEditBookingModal,
  setShowEditBookingModal,
  booking,
}) => {
  const { fetchUser } = useUser();
  const [startTime, setStartTime] = useState(
    new Date(booking.start_time).getHours()
  );
  const [endTime, setEndTime] = useState(new Date(booking.end_time).getHours());
  const [price, setPrice] = useState(booking.price);

  const [startDate, setStartDate] = useState(new Date(booking.start_time));
  const [endDate, setEndDate] = useState(new Date(booking.end_time));
  const [minStartTime, setMinStartTime] = useState(
    startDate.getDate() == new Date().getDate() ? getNextHour() : 0
  );
  const [minEndTime, setMinEndTime] = useState(
    minStartTime + 1 > 23 ? 0 : minStartTime + 1
  );

  useEffect(() => {
    if (startDate > endDate) {
      setEndDate(new Date(startDate));
    }

    if (startDate.getDate() != new Date().getDate()) {
      setMinStartTime(0);
    } else {
      setMinStartTime(getNextHour());
    }

    if (endDate.getDate() != new Date().getDate()) {
      setMinEndTime(0);
    } else {
      setMinEndTime(getNextHour() + 1 > 23 ? 0 : getNextHour() + 1);
    }

    if (startDate.getDate() == endDate.getDate() && startTime >= endTime) {
      setEndTime(startTime + 1);
    }

    calculatePrice();
  }, [startDate, endDate]);

  useEffect(() => {
    if (startTime >= endTime && startDate.getDate() == endDate.getDate()) {
      if (startTime + 1 > 23) {
        setEndTime(0);
        setMinEndTime(0);
        setEndDate(new Date(endDate.setDate(endDate.getDate() + 1)));
      } else {
        setEndTime(startTime + 1);
        setMinEndTime(startTime + 1);
      }
    }

    calculatePrice();
  }, [startTime, endTime]);

  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

  const twoWeeksFromStartDay = new Date(startDate);
  twoWeeksFromStartDay.setDate(twoWeeksFromStartDay.getDate() + 14);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
  };

  const calculatePrice = () => {
    const days =
      (new Date(booking.end_time) - new Date(booking.start_time)) /
      (1000 * 60 * 60 * 24);
    const pricePerDay = booking.price / days;

    const newDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
    const newPrice = newDays * pricePerDay;

    setPrice(newPrice);
  };

  const handleEditBooking = async () => {
    // start date and start time in iso format
    // end date and end time in iso format
    const start = new Date(startDate);
    start.setHours(startTime);
    const end = new Date(endDate);
    end.setHours(endTime);

    const body = {
      price: price,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    };
    const response = await makeRequest(`/bookings/${booking._id}`, "PUT", body);

    if (response.error) {
      throw new Error(response.error);
    } else {
      fetchUser();
      setShowEditBookingModal(false);
    }
  };

  return (
    <div>
      <Button
        className="bg-custom-orange hover:bg-custom-orange-dark text-white"
        onClick={() => setShowEditBookingModal(true)}
      >
        Edit Booking
      </Button>
      <Modal
        show={showEditBookingModal}
        onClose={() => setShowEditBookingModal(false)}
      >
        <Modal.Header className="bg-custom-orange text-white">
          Edit Booking
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col">
            <div className="flex justify-between space-x-4 mb-4 pr-4">
              <div className="w-1/2">
                <h3 className="font-bold text-sm text-gray-500 mb-1">Start</h3>
                <input
                  type="date"
                  id="start"
                  name="trip-start"
                  value={formatDate(startDate)}
                  min={formatDate(new Date())}
                  max={formatDate(sixMonthsFromNow)}
                  onChange={(e) => setStartDate(new Date(e.target.value))}
                  className="border w-full text-base placeholder-black"
                />
              </div>
              <div className="w-1/2">
                <h3 className="font-bold text-sm text-gray-500 mb-1">End</h3>
                <input
                  type="date"
                  id="end"
                  name="trip-end"
                  value={formatDate(endDate)}
                  min={formatDate(startDate)}
                  max={formatDate(twoWeeksFromStartDay)}
                  onChange={(e) => setEndDate(new Date(e.target.value))}
                  className="border w-full text-base placeholder-black"
                />
              </div>
            </div>
            <div className="flex justify-between space-x-4 mb-4 pr-4">
              <div className="w-1/2">
                <TimePicker
                  minTime={minStartTime}
                  maxTime={23}
                  value={startTime}
                  onChange={setStartTime}
                />
              </div>
              <div className="w-1/2">
                <TimePicker
                  minTime={minEndTime}
                  maxTime={23}
                  value={endTime}
                  onChange={setEndTime}
                />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-500 mb-1">
                Total Price: ${price}
              </h3>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex flex-row justify-end space-x-4">
            <Button
              className="bg-custom-orange hover:bg-custom-orange-dark text-white"
              onClick={() => setShowEditBookingModal(false)}
            >
              Close
            </Button>
            <Button
              className="bg-custom-orange hover:bg-custom-orange-dark text-white"
              onClick={handleEditBooking}
            >
              Edit Booking
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EditBookingModal;

EditBookingModal.propTypes = {
  showEditBookingModal: PropTypes.bool.isRequired,
  setShowEditBookingModal: PropTypes.func.isRequired,
  booking: PropTypes.object.isRequired,
};
