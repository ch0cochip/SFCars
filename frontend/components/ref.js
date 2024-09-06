import React from "react";
import LoginSideBar from "@components/LoginSideBar";

const ManageBooking = () => {
  const bookings = [
    {
      id: 1,
      startTime: "2023-07-30 10:00 AM",
      endTime: "2023-07-30 12:00 PM",
      price: 100,
    },
    {
      id: 2,
      startTime: "2023-07-31 02:00 PM",
      endTime: "2023-07-31 05:00 PM",
      price: 150,
    },
  ];

  const finishedBookings = [
    {
      id: 3,
      startTime: "2023-07-29 08:00 AM",
      endTime: "2023-07-29 10:00 AM",
      price: 80,
    },
    {
      id: 4,
      startTime: "2023-07-28 11:00 AM",
      endTime: "2023-07-28 01:00 PM",
      price: 120,
    },
  ];

  const handleEditBooking = (booking) => {
    console.log("Editing booking:", booking);
  };

  const handleCancelBooking = (bookingId) => {
    console.log("Canceling booking with ID:", bookingId);
  };

  return (
    <div className="flex flex-row w-full mt-12 bg-gray-100">
      <div className="w-1/3 rounded-lg p-5">
        <LoginSideBar />
      </div>
      <div className="flex flex-col w-full ml-5 p-5 bg-white shadow-md rounded-lg">
        <div className="my-8">
          <h1 className="text-2xl font-bold mb-4">Current Bookings</h1>
          {bookings.map((booking) => (
            <div key={booking.id} className="border rounded p-4 mb-4">
              <div className="flex justify-between">
                <span className="font-bold">Start Time:</span>
                <span>{booking.startTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">End Time:</span>
                <span>{booking.endTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Price:</span>
                <span>${booking.price}</span>
              </div>
              <div className="flex mt-4">
                <button
                  className="blue_btn"
                  onClick={() => handleEditBooking(booking)}
                >
                  Edit
                </button>
                <button
                  className="blue_btn"
                  onClick={() => handleCancelBooking(booking.id)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="my-8">
          <h1 className="text-2xl font-bold mb-4">Review Bookings</h1>
          {finishedBookings.map((booking) => (
            <div key={booking.id} className="border rounded p-4 mb-4">
              <div className="flex justify-between">
                <span className="font-bold">Start Time:</span>
                <span>{booking.startTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">End Time:</span>
                <span>{booking.endTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Price:</span>
                <span>${booking.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageBooking;
