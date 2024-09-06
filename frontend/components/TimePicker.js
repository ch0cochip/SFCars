import React, { useMemo } from "react";
import Select from "react-select";
import PropTypes from "prop-types";

function TimePicker({ minTime, maxTime, value, onChange }) {
  // Convert an integer to a time string in 12-hour format.
  function intToTime(hours) {
    const h = hours;
    const period = h >= 12 ? "PM" : "AM";
    return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:00 ${period}`;
  }

  // Create an array of times from 0 to 23 with the specified increment.
  const times = useMemo(() => {
    const timesArr = [];
    for (let i = 0; i < 24; i += 1) {
      if (i >= minTime && i <= maxTime) {
        timesArr.push({ value: i, label: intToTime(i) });
      }
    }
    return timesArr;
  }, [minTime, maxTime, value]);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      border: "1px solid black",
      borderRadius: 0,
      background: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path d='M8 0a8 8 0 100 16A8 8 0 008 0zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zm.5-6H8a.5.5 0 000 1h1a.5.5 0 00.5-.5V6a.5.5 0 00-.5-.5z' fill='%23000000'></path></svg>") no-repeat right .75rem center/16px 16px`,
      paddingRight: "2rem", // Increase padding to cover the arrow
    }),
    menu: (provided) => ({
      ...provided,
      width: "100%",
      textAlign: "left",
      marginTop: 0,
      borderRadius: 0,
    }),
    option: (provided) => ({
      ...provided,
      padding: 10,
    }),
    dropdownIndicator: () => ({}), // Disable dropdown indicator
    indicatorSeparator: () => ({}), // Disable indicator separator
  };

  const components = {
    DropdownIndicator: null, // This removes the dropdown indicator
  };

  return (
    <Select
      className="w-full bg-white"
      options={times}
      styles={customStyles}
      components={components}
      menuPlacement="auto"
      value={times.find((time) => time.value === value)}
      onChange={(option) => onChange(option.value)}
    />
  );
}

export default TimePicker;

TimePicker.propTypes = {
  minTime: PropTypes.number.isRequired,
  maxTime: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};
