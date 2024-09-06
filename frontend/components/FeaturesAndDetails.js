import PropTypes from "prop-types";
import { Button, Carousel } from "flowbite-react";
import { fileToDataUrl } from "@utils/utils";
import Image from "next/image";
import { useRef, useState } from "react";

const FeaturesAndDetails = ({
  prevStep,
  nextStep,
  photos,
  setPhotos,
  safetyFeatures,
  setSafetyFeatures,
  amenities,
  setAmenities,
}) => {
  const inputFileRef = useRef(null);
  const [photosError, setPhotosError] = useState("");

  const handleButtonClick = () => {
    inputFileRef.current.click();
  };
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    const urls = [];
    const errors = [];

    for (const file of files) {
      const result = await fileToDataUrl(file);
      if (result.error) {
        errors.push(result.error);
      } else {
        urls.push(result);
      }
    }

    if (errors.length > 0) {
      console.error("Errors occurred during file processing:", errors);
    }

    if (urls.length > 0) {
      setPhotos((prevPhotos) => [...prevPhotos, ...urls]);
      setPhotosError("");
    }
  };

  const handleSafetyFeaturesChange = (value) => {
    const features = value
      .trim()
      .split(",")
      .map((feature) => feature.trim());
    setSafetyFeatures(features);
  };

  const handleAmenitiesChange = (value) => {
    const amenitiesList = value
      .trim()
      .split(",")
      .map((amenity) => amenity.trim());
    setAmenities(amenitiesList);
  };

  const handleNextClick = () => {
    const isPhotosExist = photos.length > 0;
    setPhotosError(isPhotosExist ? "" : "At least one photo is required");

    if (isPhotosExist) {
      nextStep();
    }
  };

  return (
    <div className="flex flex-col w-full justify-between ml-5 p-5 bg-white shadow-md rounded-lg overflow-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <div className="flex flex-col">
          <h1 className="heading_text text-3xl text-gray-700">
            Photos and Features
          </h1>

          <div className="flex flex-col w-full mt-5">
            <Button
              className="bg-custom-orange rounded-full"
              onClick={handleButtonClick}
            >
              {photos.length > 0
                ? `${photos.length} file(s) chosen`
                : "Choose files"}
            </Button>
            <input
              ref={inputFileRef}
              type="file"
              accept="image/jpeg, image/png, image/jpg"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
            {photos.length > 0 && (
              <Carousel slideInterval={5000} className="mt-4 h-80">
                {photos.map((photo, index) => (
                  <Image
                    key={index}
                    src={photo}
                    alt="photo"
                    width={100}
                    height={100}
                  />
                ))}
              </Carousel>
            )}
            <p className="error_text">{photosError}</p>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mt-5">
            <label className="mb-2 mt-4 text-gray-600">
              Safety features: (optional)
            </label>
            <textarea
              className="w-full h-32 border-2 border-gray-300 rounded-lg p-2 resize-none"
              placeholder="CCTV, On-site security, Well lit, ..."
              value={safetyFeatures.join(", ")}
              onChange={(e) => handleSafetyFeaturesChange(e.target.value)}
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 mt-4 text-gray-600">
              Amenities: (optional)
            </label>
            <textarea
              className="w-full h-32 border-2 border-gray-300 rounded-lg p-2 resize-none"
              placeholder="Restrooms, Nearby shopping, ..."
              value={amenities.join(", ")}
              onChange={(e) => handleAmenitiesChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between w-full mt-4 px-5 py-5">
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
  );
};
export default FeaturesAndDetails;

FeaturesAndDetails.propTypes = {
  prevStep: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  photos: PropTypes.array.isRequired,
  setPhotos: PropTypes.func.isRequired,
  safetyFeatures: PropTypes.array.isRequired,
  setSafetyFeatures: PropTypes.func.isRequired,
  amenities: PropTypes.array.isRequired,
  setAmenities: PropTypes.func.isRequired,
};
