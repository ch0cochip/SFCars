"use client";

import { useState } from "react";
import SearchBar from "@components/SearchBar";
import { Button } from "flowbite-react";
import PropTypes from "prop-types";

const ListYourSpot = ({ prevStep, nextStep, address, setAddress }) => {
  const [addressError, setAddressError] = useState("");

  const validateAddress = () => {
    const isAddressExist = !!address;
    const isAddressValid =
      isAddressExist && address.street && address.street_number;
    setAddressError(
      isAddressExist
        ? isAddressValid
          ? ""
          : "Please specify an exact address"
        : "This field is required"
    );

    if (isAddressValid) {
      nextStep();
    }
  };

  const searchClick = (data) => {
    if (data) {
      setAddress(data);
    }
  };

  return (
    <div className="flex flex-col w-full justify-between ml-5 p-5 bg-white shadow-md rounded-lg overflow-auto">
      <div className="flex flex-col w-full">
        <h1 className="heading_text text-3xl text-gray-700">List your spot!</h1>

        <div className="mb-2 mt-4">
          <label
            htmlFor="address"
            className="mb-2 mt-4 text-gray-600 dark:text-gray-200"
          >
            Enter your address:
          </label>
          <div className="w-96 mb-14">
            <SearchBar
              placeholder="Search Address"
              className="border border-transparent w-full h-12 px-3 rounded-full shadow-md text-base outline-none overflow-ellipsis overflow-hidden whitespace-nowrap absolute left-1/2 transform -translate-x-1/2 placeholder-black-400"
              onSearch={searchClick}
              showSearchButton={false}
              initialValue={address.formatted_address}
            />
          </div>
          <p className="error_text">{addressError}</p>
        </div>

        <div className="flex justify-between w-96">
          <Button className="bg-custom-orange rounded-full" onClick={prevStep}>
            Back
          </Button>
          <Button
            className="bg-custom-orange rounded-full"
            onClick={validateAddress}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ListYourSpot;

ListYourSpot.propTypes = {
  prevStep: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  address: PropTypes.object.isRequired,
  setAddress: PropTypes.func.isRequired,
};
