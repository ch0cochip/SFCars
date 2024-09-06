"use client";

import { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "flowbite-react";

const DescribeParkingSpot = ({
  prevStep,
  nextStep,
  describeParkingSpace,
  setDescribeParkingSpace,
  driverInstructions,
  setDriverInstructions,
}) => {
  const [describeParkingSpaceError, setDescribeParkingSpaceError] =
    useState("");
  const [driverInstructionsError, setDriverInstructionsError] = useState("");

  const handleNextClick = () => {
    const isDescribeParkingSpaceExist = !!describeParkingSpace;
    setDescribeParkingSpaceError(
      isDescribeParkingSpaceExist ? "" : "This field is required"
    );

    const isDriverInstructionsExist = !!driverInstructions;
    setDriverInstructionsError(
      isDriverInstructionsExist ? "" : "This field is required"
    );

    if (isDescribeParkingSpaceExist && isDriverInstructionsExist) {
      nextStep();
    }
  };

  return (
    <div
      className="flex flex-col w-full justify-between ml-5 p-5 bg-white shadow-md rounded-lg overflow-auto"
      style={{ height: "70vh" }}
    >
      <div className="flex flex-col w-full">
        <h1 className="heading_text text-3xl text-gray-700 mb-5">
          Describe your parking spot.
        </h1>

        <label className="mb-2 mt-4 text-gray-600">
          Describe your parking space:
        </label>
        <textarea
          className={`w-full h-32 border-2 border-gray-300 rounded-lg p-2 resize-none ${
            describeParkingSpaceError ? "border-red-500" : ""
          }`}
          placeholder="Describe what makes your spot special (e.g. nearby locations, convenience)."
          value={describeParkingSpace}
          onChange={(e) => setDescribeParkingSpace(e.target.value)}
        />
        <p className="error_text">{describeParkingSpaceError}</p>

        <label className="mb-2 mt-4 text-gray-600">
          Instructions for drivers:
        </label>
        <textarea
          className={`w-full h-32 border-2 border-gray-300 rounded-lg p-2 resize-none ${
            driverInstructionsError ? "border-red-500" : ""
          }`}
          placeholder="Describe how to access your spot. This will be hidden until a booking is made."
          value={driverInstructions}
          onChange={(e) => setDriverInstructions(e.target.value)}
        />
        <p className="error_text">{driverInstructionsError}</p>

        <div className="flex justify-between mt-4">
          <Button className="bg-custom-orange rounded-full" onClick={prevStep}>
            Back
          </Button>
          <Button
            className="bg-custom-orange rounded-full"
            onClick={handleNextClick}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DescribeParkingSpot;

DescribeParkingSpot.propTypes = {
  prevStep: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  describeParkingSpace: PropTypes.string.isRequired,
  setDescribeParkingSpace: PropTypes.func.isRequired,
  driverInstructions: PropTypes.string.isRequired,
  setDriverInstructions: PropTypes.func.isRequired,
};
