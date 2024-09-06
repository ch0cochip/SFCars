"use client";

import { Button } from "flowbite-react";
import PropTypes from "prop-types";

const ConfirmListing = ({ nextStep, resetFields, edit }) => {
  const handleNextClick = () => {
    resetFields();
    nextStep();
  };

  return (
    <div className="flex flex-col w-full justify-between ml-5 p-5 bg-white shadow-md rounded-lg overflow-auto mt-12">
      <h1 className="heading_text text-3xl text-gray-700 mb-5">
        Listing {edit.id ? "Updated" : "Created"}
      </h1>

      <p className="mb-5">
        Your listing has been {edit.id ? "updated" : "created"} successfully!
      </p>

      <div className="flex mt-4">
        <Button
          className="bg-custom-orange rounded-full"
          onClick={handleNextClick}
        >
          Back to Listings
        </Button>
      </div>
    </div>
  );
};

export default ConfirmListing;

ConfirmListing.propTypes = {
  nextStep: PropTypes.func.isRequired,
  resetFields: PropTypes.func.isRequired,
  edit: PropTypes.object.isRequired,
};
