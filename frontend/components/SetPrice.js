"use client";

import { useEffect, useState } from "react";
import { Button, ToggleSwitch } from "flowbite-react";
import PropTypes from "prop-types";
import TimePicker from "@components/TimePicker";

const SetPrice = ({
  prevStep,
  nextStep,
  hourlyPrice,
  setHourlyPrice,
  monthlyPrice,
  setMonthlyPrice,
  isAvailble24Hours,
  setIsAvailble24Hours,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  availableDays,
  setAvailableDays,
}) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [minEndTime, setMinEndTime] = useState(startTime + 1);
  const [isHourlyActive, setIsHourlyActive] = useState(hourlyPrice !== "");
  const [isMonthlyActive, setIsMonthlyActive] = useState(monthlyPrice !== "");

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const hourlyToggle = () => {
    setIsHourlyActive(!isHourlyActive);
  };

  const monthlyToggle = () => {
    setIsMonthlyActive(!isMonthlyActive);
    if (!isMonthlyActive) {
      setIsAvailble24Hours(true);
    }
  };

  useEffect(() => {
    if (startTime >= endTime) {
      if (startTime + 1 > 23) {
        setEndTime(0);
        setMinEndTime(0);
      } else {
        setEndTime(startTime + 1);
        setMinEndTime(startTime + 1);
      }
    }
  }, [startTime, endTime]);

  const handleNextClick = () => {
    const ratePattern = /^\d+(\.\d+)?$/;
    let hourlyExist = !!hourlyPrice;
    let hourlyValid = hourlyExist && ratePattern.test(hourlyPrice);
    let monthlyExist = !!monthlyPrice;
    let monthlyValid = monthlyExist && ratePattern.test(monthlyPrice);

    if (!isHourlyActive && !isMonthlyActive) {
      setErrorMessage("Please select at least hourly or monthly booking.");
    }

    if (isHourlyActive) {
      setErrorMessage(
        hourlyExist
          ? hourlyValid
            ? ""
            : "Please enter digits only."
          : "Please enter an hourly rate."
      );
    }

    if (isMonthlyActive) {
      setErrorMessage(
        monthlyExist
          ? monthlyValid
            ? ""
            : "Please enter digits only."
          : "Please enter a monthly rate."
      );
    }

    if ((isHourlyActive && hourlyValid) || (isMonthlyActive && monthlyValid)) {
      nextStep();
    }
  };

  return (
    <div className="flex flex-col w-full justify-between ml-5 p-5 bg-white shadow-md rounded-lg overflow-auto">
      <h1 className="heading_text text-3xl text-gray-700 mb-5">
        Price and Availability.
      </h1>
      <p className="mb-5">
        You can select either hourly or monthly bookings or both.
      </p>

      <div className="flex flex-col">
        <div className="flex items-center mb-4">
          <div
            className={`${
              isHourlyActive ? "bg-custom-orange" : "bg-gray-300"
            } w-6 h-6 rounded-full p-1 flex items-center cursor-pointer mr-2`}
            onClick={hourlyToggle}
          ></div>
          <span className="text-sm">Allow hourly bookings</span>
        </div>
        {isHourlyActive && (
          <>
            <label className="mb-2 mt-2 text-gray-600">Hourly</label>
            <div className="relative">
              <input
                className="text-gray-500 text-left w-full border-b border-gray-300 pl-8 p-2 mb-4"
                placeholder="0.00"
                value={hourlyPrice}
                onChange={(e) => setHourlyPrice(e.target.value)}
              />
              <span className="absolute left-3 top-2">$</span>
            </div>
          </>
        )}

        <div className="flex items-center mb-4">
          <div
            className={`${
              isMonthlyActive ? "bg-custom-orange" : "bg-gray-300"
            } w-6 h-6 rounded-full p-1 flex items-center cursor-pointer mr-2`}
            onClick={monthlyToggle}
          ></div>
          <span className="text-sm">Allow monthly bookings</span>
        </div>
        {isMonthlyActive && (
          <>
            <label className="mb-2 mt-2 text-gray-600">Monthly</label>
            <div className="relative">
              <input
                className="text-gray-500 text-left w-full border-b border-gray-300 pl-8 p-2 mb-4"
                placeholder="0.00"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(e.target.value)}
              />
              <span className="absolute left-3 top-2">$</span>
            </div>
          </>
        )}

        <div className="flex flex-col mb-4 mt-4">
          <h1 className="heading_text text-2xl text-gray-700 ">
            When is your spot available to rent?
          </h1>
          <ToggleSwitch
            className="mt-4"
            checked={isAvailble24Hours}
            disabled={isMonthlyActive}
            onChange={() => setIsAvailble24Hours(!isAvailble24Hours)}
            label="Available 24 hours"
          />
          {isMonthlyActive && (
            <p className="mb-4 mt-4 text-sm text-red-600">
              Your parking is automatically available 24 hours a day if you
              allow monthly bookings.
            </p>
          )}
          {!isAvailble24Hours && (
            <div>
              <div className="flex flex-row mt-4">
                {daysOfWeek.map((day, index) => (
                  <button
                    className={`px-4 py-2 mr-2 ${
                      availableDays[day] ? "bg-custom-orange" : "bg-white"
                    }`}
                    onClick={() =>
                      setAvailableDays({
                        ...availableDays,
                        [day]: !availableDays[day],
                      })
                    }
                    key={index}
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                  </button>
                ))}
              </div>
              <hr className="border-t-2 border-gray-300 mt-4" />
              <div className="flex flex-row justify-between items-center mt-4">
                <div>Start Time</div>
                <div className="w-36">
                  <TimePicker
                    minTime={0}
                    maxTime={23}
                    value={startTime}
                    onChange={setStartTime}
                  />
                </div>
              </div>
              <hr className="border-t-2 border-gray-300 mt-4" />
              <div className="flex flex-row justify-between items-center mt-4">
                <div>End Time</div>
                <div className="w-36">
                  <TimePicker
                    minTime={minEndTime}
                    maxTime={23}
                    value={endTime}
                    onChange={setEndTime}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {errorMessage && (
          <p className="text-red-500 mb-4 bg-red-100 py-2 px-4 text-center rounded-lg">
            {errorMessage}
          </p>
        )}

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

export default SetPrice;

SetPrice.propTypes = {
  prevStep: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  hourlyPrice: PropTypes.string.isRequired,
  setHourlyPrice: PropTypes.func.isRequired,
  monthlyPrice: PropTypes.string.isRequired,
  setMonthlyPrice: PropTypes.func.isRequired,
  isAvailble24Hours: PropTypes.bool.isRequired,
  setIsAvailble24Hours: PropTypes.func.isRequired,
  startTime: PropTypes.number.isRequired,
  setStartTime: PropTypes.func.isRequired,
  endTime: PropTypes.number.isRequired,
  setEndTime: PropTypes.func.isRequired,
  availableDays: PropTypes.object.isRequired,
  setAvailableDays: PropTypes.func.isRequired,
};
