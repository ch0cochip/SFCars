import PropTypes from "prop-types";
import { Button, Carousel } from "flowbite-react";
import Image from "next/image";
import { Tooltip, Chip } from "@mui/material";
import { makeRequest } from "@utils/utils";
import { useUser } from "@contexts/UserProvider";

const PreviewListingDetails = ({
  prevStep,
  nextStep,
  address,
  selectedTypeOfSpot,
  selectedMaxVehicleSize,
  selectedAccessType,
  selectedElectricCharging,
  describeParkingSpace,
  driverInstructions,
  hourlyPrice,
  monthlyPrice,
  isAvailble24Hours,
  startTime,
  endTime,
  availableDays,
  photos,
  safetyFeatures,
  amenities,
  edit,
}) => {
  const { fetchUser } = useUser();

  const formatTime = (time) => {
    if (time === 0) return "12:00 AM";
    if (time === 12) return "12:00 PM";
    return time < 12 ? `${time}:00 AM` : `${time - 12}:00 PM`;
  };

  const formatTimeBody = (time) => {
    if (time < 10) return `0${time}:00`;
    return `${time}:00`;
  };

  const handleConfirmClick = async () => {
    const body = {
      address,
      listing_type: selectedTypeOfSpot,
      max_vehicle_size: selectedMaxVehicleSize,
      access_type: selectedAccessType,
      electric_charging: selectedElectricCharging,
      description: describeParkingSpace,
      instructions: driverInstructions,
      photos,
      availability: {
        is_24_7: isAvailble24Hours,
        start_time: formatTimeBody(startTime),
        end_time: formatTimeBody(endTime),
        available_days: availableDays,
      },
      safety_features: safetyFeatures,
      amenities,
    };

    if (hourlyPrice.trim() !== "") {
      body.hourly_rate = hourlyPrice;
    }

    if (monthlyPrice.trim() !== "") {
      body.monthly_rate = monthlyPrice;
    }
    if (edit.id) {
      const response = await makeRequest(`/listings/${edit.id}`, "PUT", body);
      if (response.error) {
        throw new Error(response.error);
      } else {
        fetchUser();
        nextStep();
      }
    } else {
      const response = await makeRequest("/listings/new", "POST", body);
      if (response.error) {
        throw new Error(response.error);
      } else {
        fetchUser();
        nextStep();
      }
    }
  };

  return (
    <div className="flex flex-col w-full justify-between ml-5 p-5 bg-white shadow-md rounded-lg overflow-auto">
      <h1 className="heading_text text-3xl text-gray-700">
        Preview Listing Details
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mt-5">
        <div className="flex flex-col">
          <h2 className="text-2xl text-gray-700">Spot Details</h2>

          <p className="mt-2 text-gray-600">
            <span className="font-bold">Address: </span> {address.street},{" "}
            {address.city}, {address.state}, {address.zip}
          </p>

          <p className="mt-2 text-gray-600">
            <span className="font-bold">Type of Spot: </span>{" "}
            {selectedTypeOfSpot}
          </p>

          <p className="mt-2 text-gray-600">
            <span className="font-bold">Max Vehicle Size: </span>{" "}
            {selectedMaxVehicleSize}
          </p>

          <p className="mt-2 text-gray-600">
            <span className="font-bold">Access Type: </span>{" "}
            {selectedAccessType}
          </p>

          <p className="mt-2 text-gray-600">
            <span className="font-bold">Electric Charging: </span>{" "}
            {selectedElectricCharging}
          </p>

          <p className="mt-2 text-gray-600">
            <span className="font-bold">Parking Space Description: </span>{" "}
            {describeParkingSpace}
          </p>

          <p className="mt-2 text-gray-600">
            <span className="font-bold">Driver Instructions: </span>{" "}
            {driverInstructions}
          </p>

          <p className="mt-2 text-gray-600">
            <span className="font-bold">Pricing: </span>{" "}
            {hourlyPrice.length != 0 && `Hourly - $${hourlyPrice}`}
            {monthlyPrice.length != 0 && ` Monthly - $${monthlyPrice}`}
          </p>

          <p className="mt-2 text-gray-600">
            <span className="font-bold">Availability: </span>{" "}
            {isAvailble24Hours
              ? "24/7"
              : `${formatTime(startTime)} - ${formatTime(endTime)}`}
          </p>

          {!isAvailble24Hours && (
            <p className="mt-2 text-gray-600">
              <span className="font-bold">Available Days: </span>{" "}
              {Object.entries(availableDays)
                .filter(([, v]) => v)
                .map(([k]) => k)
                .join(", ")}
            </p>
          )}

          <h2 className="mt-5 text-2xl text-gray-700">Safety Features</h2>
          <div className="mt-2">
            {safetyFeatures.map((feature, index) => (
              <Tooltip key={index} title={feature} arrow>
                <Chip label={feature} className="m-1" />
              </Tooltip>
            ))}
          </div>

          <h2 className="mt-5 text-2xl text-gray-700">Amenities</h2>
          <div className="mt-2">
            {amenities.map((amenity, index) => (
              <Tooltip key={index} title={amenity} arrow>
                <Chip label={amenity} className="m-1" />
              </Tooltip>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <h2 className="text-2xl text-gray-700">Photos</h2>
          <Carousel slideInterval={5000} className="mt-4 h-80">
            {photos.map((photo, index) => (
              <Image
                key={index}
                src={photo}
                alt="photo"
                width={500}
                height={500}
              />
            ))}
          </Carousel>
        </div>
      </div>

      <div className="flex justify-between w-full mt-4 px-5 py-5">
        <Button className="bg-custom-orange rounded-full" onClick={prevStep}>
          Back
        </Button>
        <Button
          className="bg-custom-orange rounded-full"
          onClick={handleConfirmClick}
        >
          {edit.id ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  );
};

export default PreviewListingDetails;

PreviewListingDetails.propTypes = {
  prevStep: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  address: PropTypes.object.isRequired,
  selectedTypeOfSpot: PropTypes.string.isRequired,
  selectedMaxVehicleSize: PropTypes.string.isRequired,
  selectedAccessType: PropTypes.string.isRequired,
  selectedElectricCharging: PropTypes.string.isRequired,
  describeParkingSpace: PropTypes.string.isRequired,
  driverInstructions: PropTypes.string.isRequired,
  hourlyPrice: PropTypes.string.isRequired,
  monthlyPrice: PropTypes.string.isRequired,
  isAvailble24Hours: PropTypes.bool.isRequired,
  startTime: PropTypes.number.isRequired,
  endTime: PropTypes.number.isRequired,
  availableDays: PropTypes.object.isRequired,
  photos: PropTypes.array.isRequired,
  safetyFeatures: PropTypes.array.isRequired,
  amenities: PropTypes.array.isRequired,
  edit: PropTypes.object.isRequired,
};
