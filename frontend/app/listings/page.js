"use client";

import LoginSideBar from "@components/LoginSideBar";
import DisplayMyListings from "@components/DisplayMyListings";
import ListYourSpot from "@components/ListYourSpot";
import ParkingSpotDetails from "@components/ParkingSpotDetails";
import DescribeParkingSpot from "@components/DescribeParkingSpot";
import SetPrice from "@components/SetPrice";
import FeaturesAndDetails from "@components/FeaturesAndDetails";
import PreviewListingDetails from "@components/PreviewListingDetails";
import ConfirmListing from "@components/ConfirmListing";
import { useState } from "react";
import { useUser } from "@contexts/UserProvider";
import { AuthRequiredError } from "@errors/exceptions";

const MyListings = () => {
  const { user } = useUser();
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({});
  const [selectedTypeOfSpot, setSelectedTypeOfSpot] = useState("");
  const [selectedMaxVehicleSize, setSelectedMaxVehicleSize] = useState("");
  const [selectedAccessType, setSelectedAccessType] = useState("");
  const [selectedElectricCharging, setSelectedElectricCharging] = useState("");
  const [describeParkingSpace, setDescribeParkingSpace] = useState("");
  const [driverInstructions, setDriverInstructions] = useState("");
  const [hourlyPrice, setHourlyPrice] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [isAvailble24Hours, setIsAvailble24Hours] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [availableDays, setAvailableDays] = useState({
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: true,
    Sunday: true,
  });
  const [photos, setPhotos] = useState([]);
  const [safetyFeatures, setSafetyFeatures] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [edit, setEdit] = useState({ id: "" });

  const resetFields = () => {
    setAddress({});
    setSelectedTypeOfSpot("");
    setSelectedMaxVehicleSize("");
    setSelectedAccessType("");
    setSelectedElectricCharging("");
    setDescribeParkingSpace("");
    setDriverInstructions("");
    setHourlyPrice("");
    setMonthlyPrice("");
    setIsAvailble24Hours(false);
    setStartTime(0);
    setEndTime(0);
    setAvailableDays({
      Monday: true,
      Tuesday: true,
      Wednesday: true,
      Thursday: true,
      Friday: true,
      Saturday: true,
      Sunday: true,
    });
    setPhotos([]);
    setSafetyFeatures([]);
    setAmenities([]);
    setEdit({});
  };

  const handleEditListing = (listing) => {
    setAddress(listing.address);
    setSelectedTypeOfSpot(listing.listing_type);
    setSelectedMaxVehicleSize(listing.max_vehicle_size);
    setSelectedAccessType(listing.access_type);
    setSelectedElectricCharging(listing.electric_charging);
    setDescribeParkingSpace(listing.description);
    setDriverInstructions(listing.instructions);
    setHourlyPrice(listing.hourly_rate ? listing.hourly_rate.toString() : "");
    setMonthlyPrice(
      listing.monthly_rate ? listing.monthly_rate.toString() : ""
    );
    setIsAvailble24Hours(listing.availability.is_24_7);
    setStartTime(parseInt(listing.availability.start_time.split(":")[0]));
    setEndTime(parseInt(listing.availability.end_time.split(":")[0]));
    setAvailableDays(listing.availability.available_days);
    setPhotos(listing.photos);
    setSafetyFeatures(listing.safety_features);
    setAmenities(listing.amenities);
    setEdit({ id: listing._id });
    setStep(1);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <DisplayMyListings
            nextStep={() => setStep(1)}
            handleEditListing={handleEditListing}
            resetFields={resetFields}
          />
        );
      case 1:
        return (
          <ListYourSpot
            prevStep={() => setStep(0)}
            nextStep={() => setStep(2)}
            address={address}
            setAddress={setAddress}
          />
        );
      case 2:
        return (
          <ParkingSpotDetails
            prevStep={() => setStep(1)}
            nextStep={() => setStep(3)}
            selectedTypeOfSpot={selectedTypeOfSpot}
            setSelectedTypeOfSpot={setSelectedTypeOfSpot}
            selectedMaxVehicleSize={selectedMaxVehicleSize}
            setSelectedMaxVehicleSize={setSelectedMaxVehicleSize}
            selectedAccessType={selectedAccessType}
            setSelectedAccessType={setSelectedAccessType}
            selectedElectricCharging={selectedElectricCharging}
            setSelectedElectricCharging={setSelectedElectricCharging}
          />
        );
      case 3:
        return (
          <DescribeParkingSpot
            prevStep={() => setStep(2)}
            nextStep={() => setStep(4)}
            describeParkingSpace={describeParkingSpace}
            setDescribeParkingSpace={setDescribeParkingSpace}
            driverInstructions={driverInstructions}
            setDriverInstructions={setDriverInstructions}
          />
        );
      case 4:
        return (
          <SetPrice
            prevStep={() => setStep(3)}
            nextStep={() => setStep(5)}
            hourlyPrice={hourlyPrice}
            setHourlyPrice={setHourlyPrice}
            monthlyPrice={monthlyPrice}
            setMonthlyPrice={setMonthlyPrice}
            isAvailble24Hours={isAvailble24Hours}
            setIsAvailble24Hours={setIsAvailble24Hours}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
            availableDays={availableDays}
            setAvailableDays={setAvailableDays}
          />
        );
      case 5:
        return (
          <FeaturesAndDetails
            prevStep={() => setStep(4)}
            nextStep={() => setStep(6)}
            photos={photos}
            setPhotos={setPhotos}
            safetyFeatures={safetyFeatures}
            setSafetyFeatures={setSafetyFeatures}
            amenities={amenities}
            setAmenities={setAmenities}
          />
        );
      case 6:
        return (
          <PreviewListingDetails
            prevStep={() => setStep(5)}
            nextStep={() => setStep(7)}
            address={address}
            selectedTypeOfSpot={selectedTypeOfSpot}
            selectedMaxVehicleSize={selectedMaxVehicleSize}
            selectedAccessType={selectedAccessType}
            selectedElectricCharging={selectedElectricCharging}
            describeParkingSpace={describeParkingSpace}
            driverInstructions={driverInstructions}
            hourlyPrice={hourlyPrice}
            monthlyPrice={monthlyPrice}
            isAvailble24Hours={isAvailble24Hours}
            startTime={startTime}
            endTime={endTime}
            availableDays={availableDays}
            photos={photos}
            safetyFeatures={safetyFeatures}
            amenities={amenities}
            edit={edit}
          />
        );
      case 7:
        return (
          <ConfirmListing
            nextStep={() => setStep(0)}
            resetFields={resetFields}
            edit={edit}
          />
        );
      default:
        return <DisplayMyListings nextStep={() => setStep(1)} />;
    }
  };

  if (!user) {
    throw new AuthRequiredError();
  }

  return (
    <div className="flex flex-row w-full mt-12">
      <div className="rounded-lg p-5">
        <LoginSideBar />
      </div>
      {renderStep()}
    </div>
  );
};

export default MyListings;
