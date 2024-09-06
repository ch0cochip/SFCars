"use client";

import { useState } from "react";
import { Button } from "flowbite-react";
import PropTypes from "prop-types";

const ParkingSpotDetails = ({
  prevStep,
  nextStep,
  selectedTypeOfSpot,
  setSelectedTypeOfSpot,
  selectedMaxVehicleSize,
  setSelectedMaxVehicleSize,
  selectedAccessType,
  setSelectedAccessType,
  selectedElectricCharging,
  setSelectedElectricCharging,
}) => {
  const typeOfSpot = ["Carport", "Driveway", "Garage", "Parking Lot"];

  const maxVehicleSize = [
    "Bike",
    "Hatchback",
    "Sedan",
    "4WD/SUV",
    "Van",
    "Truck",
  ];

  const accessType = [
    "None",
    "Boom Gate",
    "Key",
    "Passcode",
    "Permit",
    "Remote",
    "Ticket",
    "Swipe Card",
  ];

  const electricCharging = [
    "None",
    "Wall (AU/NZ)",
    "Type 1 (SAE J-1772)",
    "Type 2",
    "CHAdeMO",
  ];

  const [isTypeOfSpotOpen, setIsTypeOfSpotOpen] = useState(false);
  const [isMaxVehicleSizeOpen, setIsMaxVehicleSizeOpen] = useState(false);
  const [isAccessTypeOpen, setIsAccessTypeOpen] = useState(false);
  const [isElectricChargingOpen, setIsElectricChargingOpen] = useState(false);

  const [typeOfSpotError, setTypeOfSpotError] = useState("");
  const [maxVehicleSizeError, setMaxVehicleSizeError] = useState("");
  const [accessTypeError, setAccessTypeError] = useState("");
  const [electricChargingError, setElectricChargingError] = useState("");

  const toggleDropdown = (dropdownName) => {
    switch (dropdownName) {
      case "typeOfSpot":
        setIsTypeOfSpotOpen(!isTypeOfSpotOpen);
        setIsMaxVehicleSizeOpen(false);
        setIsAccessTypeOpen(false);
        setIsElectricChargingOpen(false);
        break;
      case "maxVehicleSize":
        setIsTypeOfSpotOpen(false);
        setIsMaxVehicleSizeOpen(!isMaxVehicleSizeOpen);
        setIsAccessTypeOpen(false);
        setIsElectricChargingOpen(false);
        break;
      case "accessType":
        setIsTypeOfSpotOpen(false);
        setIsMaxVehicleSizeOpen(false);
        setIsAccessTypeOpen(!isAccessTypeOpen);
        setIsElectricChargingOpen(false);
        break;
      case "electricCharging":
        setIsTypeOfSpotOpen(false);
        setIsMaxVehicleSizeOpen(false);
        setIsAccessTypeOpen(false);
        setIsElectricChargingOpen(!isElectricChargingOpen);
        break;
      default:
        break;
    }
  };

  const selectTypeOfSpot = (spot) => {
    setSelectedTypeOfSpot(spot);
    setIsTypeOfSpotOpen(false);
    setTypeOfSpotError("");
  };

  const selectMaxVehicleSize = (size) => {
    setSelectedMaxVehicleSize(size);
    setIsMaxVehicleSizeOpen(false);
    setMaxVehicleSizeError("");
  };

  const selectAccessType = (access) => {
    setSelectedAccessType(access);
    setIsAccessTypeOpen(false);
    setAccessTypeError("");
  };

  const selectElectricCharging = (charging) => {
    setSelectedElectricCharging(charging);
    setIsElectricChargingOpen(false);
    setElectricChargingError("");
  };

  const handleNextClick = () => {
    const isTypeOfSpotExist = !!selectedTypeOfSpot;
    setTypeOfSpotError(isTypeOfSpotExist ? "" : "This field is required");

    const isMaxVehicleSizeExist = !!selectedMaxVehicleSize;
    setMaxVehicleSizeError(
      isMaxVehicleSizeExist ? "" : "This field is required"
    );

    const isAccessTypeExist = !!selectedAccessType;
    setAccessTypeError(isAccessTypeExist ? "" : "This field is required");

    const isElectricChargingExist = !!selectedElectricCharging;
    setElectricChargingError(
      isElectricChargingExist ? "" : "This field is required"
    );

    if (
      isTypeOfSpotExist &&
      isMaxVehicleSizeExist &&
      isAccessTypeExist &&
      isElectricChargingExist
    ) {
      nextStep();
    }
  };

  return (
    <div className="flex flex-col w-full h-full justify-between ml-5 p-5 bg-white shadow-md rounded-lg overflow-auto">
      <div className="flex flex-col w-full">
        <h1 className="heading_text mb-5">Tell us about your parking spot.</h1>

        <h2 className="text-lg font-bold">Space Details</h2>

        <label className="mt-2 mb-1">Type of Spot</label>
        <div className="relative">
          <button
            id="dropdownDefaultButton-spotType"
            data-dropdown-toggle="typeOfSpot"
            className={`text-gray-500 text-left bg-white w-96 border-b border-black p-2 ${
              typeOfSpotError ? "border-red-500" : ""
            }`}
            type="button"
            onClick={() => toggleDropdown("typeOfSpot")}
          >
            {selectedTypeOfSpot || "Choose your type of spot"}
          </button>
          {isTypeOfSpotOpen && (
            <div
              id="typeOfSpot"
              className={`absolute z-10 ${
                isTypeOfSpotOpen ? "block" : "hidden"
              } bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700`}
            >
              <ul
                className="py-2 text-sm text-gray-700 dark:text-gray-20"
                aria-labelledby="dropdownDefaultButton-spotType"
              >
                {typeOfSpot.map((spot, index) => (
                  <li key={index}>
                    <button
                      className="px-4 w-full py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      onClick={() => selectTypeOfSpot(spot)}
                    >
                      {spot}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <p className="error_text">{typeOfSpotError}</p>

        <label className="mt-2 mb-1">Max. Vehicle Size</label>
        <div className="relative">
          <button
            id="dropdownDefaultButton-vehicleSize"
            data-dropdown-toggle="maxVehicleSize"
            className={`text-gray-500 text-left bg-white w-96 border-b border-black p-2 ${
              maxVehicleSizeError ? "border-red-500" : ""
            }`}
            type="button"
            onClick={() => toggleDropdown("maxVehicleSize")}
          >
            {selectedMaxVehicleSize || "Select max vehicle size"}
          </button>
          {isMaxVehicleSizeOpen && (
            <div
              id="maxVehicleSize"
              className={`absolute z-10 ${
                isMaxVehicleSizeOpen ? "block" : "hidden"
              } bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700`}
            >
              <ul
                className="py-2 text-sm text-gray-700 dark:text-gray-20"
                aria-labelledby="dropdownDefaultButton-vehicleSize"
              >
                {maxVehicleSize.map((size, index) => (
                  <li key={index}>
                    <button
                      className="block w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      onClick={() => selectMaxVehicleSize(size)}
                    >
                      {size}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <p className="error_text">{maxVehicleSizeError}</p>

        <h6 className="text-lg font-bold mt-4">
          How can drivers access this space?
        </h6>
        <label className="mt-2 mb-1">Access Details:</label>
        <div className="relative">
          <button
            id="dropdownDefaultButton-accessType"
            data-dropdown-toggle="accessType"
            className={`text-gray-500 text-left bg-white w-96 border-b border-black p-2 ${
              accessTypeError ? "border-red-500" : ""
            }`}
            type="button"
            onClick={() => toggleDropdown("accessType")}
          >
            {selectedAccessType || "Select access type"}
          </button>
          {isAccessTypeOpen && (
            <div
              id="accessType"
              className={`absolute z-10 ${
                isAccessTypeOpen ? "block" : "hidden"
              } bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700`}
            >
              <ul
                className="py-2 text-sm text-gray-700 dark:text-gray-20"
                aria-labelledby="dropdownDefaultButton-accessType"
              >
                {accessType.map((accType, index) => (
                  <li key={index}>
                    <button
                      className="block w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      onClick={() => selectAccessType(accType)}
                    >
                      {accType}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <p className="error_text">{accessTypeError}</p>

        <h6 className="text-lg font-bold mt-4">
          Does your spot have EV charging?
        </h6>
        <label className="mt-2 mb-1">Electric Charging:</label>
        <div className="relative">
          <button
            id="dropdownDefaultButton-elecCharging"
            data-dropdown-toggle="electricCharging"
            className={`text-gray-500 text-left bg-white w-96 border-b border-black p-2 ${
              electricChargingError ? "border-red-500" : ""
            }`}
            type="button"
            onClick={() => toggleDropdown("electricCharging")}
          >
            {selectedElectricCharging || "Select electric charging"}
          </button>
          {isElectricChargingOpen && (
            <div
              id="elecCharging"
              className={`absolute z-10 ${
                isElectricChargingOpen ? "block" : "hidden"
              } bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700`}
            >
              <ul
                className="py-2 text-sm text-gray-700 dark:text-gray-20"
                aria-labelledby="dropdownDefaultButton-elecCharging"
              >
                {electricCharging.map((elecCharge, index) => (
                  <li key={index}>
                    <button
                      className="block w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      onClick={() => selectElectricCharging(elecCharge)}
                    >
                      {elecCharge}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <p className="error_text">{electricChargingError}</p>

        <div className="flex justify-between w-96 mt-4">
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

export default ParkingSpotDetails;

ParkingSpotDetails.propTypes = {
  prevStep: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  selectedTypeOfSpot: PropTypes.string.isRequired,
  setSelectedTypeOfSpot: PropTypes.func.isRequired,
  selectedMaxVehicleSize: PropTypes.string.isRequired,
  setSelectedMaxVehicleSize: PropTypes.func.isRequired,
  selectedAccessType: PropTypes.string.isRequired,
  setSelectedAccessType: PropTypes.func.isRequired,
  selectedElectricCharging: PropTypes.string.isRequired,
  setSelectedElectricCharging: PropTypes.func.isRequired,
};
