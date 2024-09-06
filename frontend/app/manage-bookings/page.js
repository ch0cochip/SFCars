"use client";

import { useState, useEffect } from "react";
import LoginSideBar from "@components/LoginSideBar";
import { Card } from "flowbite-react";
import CancelBookingModal from "@components/CancelBookingModal";
import EditBookingModal from "@components/EditBookingModal";
import ReviewModal from "@components/ReviewModal";
import { makeRequest } from "@utils/utils";
import { useUser } from "@contexts/UserProvider";
import Loading from "@components/Loading";

const ManageBooking = () => {
  const { user } = useUser();
  const [bookings, setBookings] = useState([]);
  const [finishedBookings, setFinishedBookings] = useState([]);
  const [showCancelBookingModal, setShowCancelBookingModal] = useState(
    user.bookings.map(() => false)
  );
  const [showEditBookingModal, setShowEditBookingModal] = useState(
    user.bookings.map(() => false)
  );
  const [showReviewModal, setShowReviewModal] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [finishedBookingsLoading, setFinishedBookingsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      const userBookings = [];
      for (const id of user.bookings) {
        setBookingsLoading(true);
        const response = await makeRequest(`/bookings/${id}`, "GET");
        if (response.error) {
          throw new Error(response.error);
        } else {
          if (new Date(response.end_time) > new Date()) {
            userBookings.push(response);
          }
        }
      }
      setBookings(userBookings);
      setBookingsLoading(false);
    };
    fetchBookings();
  }, [user.bookings]);

  useEffect(() => {
    setShowEditBookingModal(user.bookings.map(() => false));
  }, [user.bookings]);

  useEffect(() => {
    setShowCancelBookingModal(user.bookings.map(() => false));
  }, [user.bookings]);

  useEffect(() => {
    setShowReviewModal(user.bookings.map(() => false));
  }, [finishedBookings]);

  useEffect(() => {
    const fetchFinishedBookings = async () => {
      setFinishedBookingsLoading(true);
      const response = await makeRequest("/profile/completed-bookings", "GET");
      if (response.error) {
        throw new Error(response.error);
      } else {
        if (response.length > 0) {
          setFinishedBookings(response);
        }
      }
      setFinishedBookingsLoading(false);
    };
    fetchFinishedBookings();
  }, []);

  const formatTime = (time) => {
    const date = new Date(time);
    const weekday = date.toLocaleString("default", { weekday: "short" });
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    let hour = date.getHours();
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    hour = hour ? hour : 12;
    const minute = date.getMinutes();
    const paddedMinute = minute < 10 ? "0" + minute : minute;

    return `${weekday}, ${day} ${month} ${year}, ${hour}:${paddedMinute} ${ampm}`;
  };

  return (
    <div className="flex flex-row w-full mt-12">
      <div className="rounded-lg p-5">
        <LoginSideBar />
      </div>
      <div
        className="flex flex-row w-full ml-5 p-5 bg-white shadow-md rounded-lg"
        style={{ height: "70vh" }}
      >
        <div className="w-1/2 pr-2 my-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4">Current Bookings</h1>
          {bookingsLoading ? (
            <div className="border rounded p-4 mb-4">
              <Loading width={100} height={100} />
            </div>
          ) : bookings.length > 0 ? (
            bookings.map((booking, index) => (
              <Card key={index} className="border rounded p-4 mb-4">
                <div className="flex justify-between">
                  <span className="font-bold">Start Time:</span>
                  <span>{formatTime(booking.start_time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">End Time:</span>
                  <span>{formatTime(booking.end_time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Price:</span>
                  <span>${booking.price}</span>
                </div>
                <div className="flex justify-between mt-4">
                  <EditBookingModal
                    showEditBookingModal={showEditBookingModal[index]}
                    setShowEditBookingModal={(value) => {
                      const newShowEditBookingModal = [...showEditBookingModal];
                      newShowEditBookingModal[index] = value;
                      setShowEditBookingModal(newShowEditBookingModal);
                    }}
                    booking={booking}
                  />
                  <CancelBookingModal
                    showCancelBookingModal={showCancelBookingModal[index]}
                    setShowCancelBookingModal={(value) => {
                      const newShowCancelBookingModal = [
                        ...showCancelBookingModal,
                      ];
                      newShowCancelBookingModal[index] = value;
                      setShowCancelBookingModal(newShowCancelBookingModal);
                    }}
                    booking={booking}
                  />
                </div>
              </Card>
            ))
          ) : (
            <div className="text-xl text-gray-500">
              You have no current bookings.
            </div>
          )}
        </div>

        <div className="w-1/2 pl-2 my-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4">Finished Bookings</h1>
          {finishedBookingsLoading ? (
            <div className="border rounded p-4 mb-4">
              <Loading width={100} height={100} />
            </div>
          ) : finishedBookings.length > 0 ? (
            finishedBookings.map((booking, index) => (
              <Card key={index} className="border rounded p-4 mb-4">
                <div className="flex justify-between">
                  <span className="font-bold">Start Time:</span>
                  <span>{formatTime(booking.start_time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">End Time:</span>
                  <span>{formatTime(booking.end_time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Price:</span>
                  <span>${booking.price}</span>
                </div>
                <ReviewModal
                  showReviewModal={showReviewModal[index]}
                  setShowReviewModal={(value) => {
                    const newShowReviewModal = [...showReviewModal];
                    newShowReviewModal[index] = value;
                    setShowReviewModal(newShowReviewModal);
                  }}
                  booking={booking}
                />
              </Card>
            ))
          ) : (
            <div className="text-xl text-gray-500">
              You have no finished bookings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageBooking;
