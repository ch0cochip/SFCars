import { Tooltip, Chip } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { BiSolidRightArrow, BiSolidLeftArrow } from "react-icons/bi";
import { calculateTotalPrice, makeRequest } from "@utils/utils";
import { useUser } from "@contexts/UserProvider";
import SearchContext from "@contexts/SearchContext";
import { useRouter } from "next/navigation";
import { FaStar } from "react-icons/fa";
import Loading from "@components/Loading";

const ListingDetail = () => {
  const { user } = useUser();
  const {
    selectedListing,
    startDate,
    endDate,
    startTime,
    endTime,
    setIsBooking,
    isCasual,
  } = useContext(SearchContext);
  const [listingUser, setListingUser] = useState(null);

  useEffect(() => {
    const fetchListingUser = async () => {
      const response = await makeRequest(
        `/user/${selectedListing.provider}`,
        "GET"
      );
      if (response.error) {
        throw new Error(response.error);
      } else {
        setListingUser(response);
      }
    };

    fetchListingUser();
  }, [selectedListing]);

  const [imageIndex, setImageIndex] = useState(0);
  const router = useRouter();

  return (
    <div className="flex flex-col item-center h-full justify-between overflow-auto">
      <div className="relative flex items-center w-full h-3/5">
        <button
          onClick={() =>
            setImageIndex(
              (imageIndex - 1 + selectedListing.images.length) %
                selectedListing.images.length
            )
          }
          className="absolute left-0 top-50 z-10 bg-gray-200 p-2 rounded-full"
        >
          <BiSolidLeftArrow />
        </button>
        <Image
          src={selectedListing.photos[imageIndex]}
          alt="Listing Image"
          className="rounded"
          width={500}
          height={500}
        />
        <button
          onClick={() =>
            setImageIndex((imageIndex + 1) % selectedListing.photos.length)
          }
          className="absolute right-0 top-50 z-10 bg-gray-200 p-2 rounded-full"
        >
          <BiSolidRightArrow />
        </button>
      </div>
      <div className="p-4 h-full pb-16">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl text-gray-500">
              {selectedListing.listing_type} on {selectedListing.address.street}
            </h1>
          </div>
        </div>
        <div className="rounded-lg">
          <h2 className="text-lg font-bold mb-2 text-custom-orange">Details</h2>
          <div className="flex items-center space-x-2 mb-2">
            {selectedListing.description}
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <AccessTimeIcon />
            <p className="text-gray-500">
              Maximum Vehicle Size: {selectedListing.max_vehicle_size}
            </p>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <VpnKeyIcon />
            <p className="text-gray-500">
              Access Method: {selectedListing.access_type}
            </p>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <LocalParkingIcon />
            <p className="text-gray-500">
              Parking Type: {selectedListing.type}
            </p>
          </div>
        </div>
        <div className="my-4">
          <h2 className="text-lg font-bold mb-2 text-custom-orange">
            Safety Features
          </h2>
          <div className="flex flex-wrap">
            {selectedListing.safety_features.map((feature, index) => (
              <Chip
                key={index}
                label={feature}
                variant="outlined"
                className="m-1"
              />
            ))}
          </div>
        </div>
        <div className="my-4">
          <h2 className="text-lg font-bold mb-2 text-custom-orange">
            Amenities
          </h2>
          <div className="flex flex-wrap">
            {selectedListing.amenities.map((amenity, index) => (
              <Tooltip key={index} title={amenity} placement="top">
                <Chip label={amenity} variant="outlined" className="m-1" />
              </Tooltip>
            ))}
          </div>
        </div>
        <div className="my-4">
          <h2 className="text-lg font-bold mb-2 text-custom-orange">Reviews</h2>
          <div className="flex flex-wrap">
            {selectedListing.reviews.length === 0 ? (
              <div>No Reviews Yet</div>
            ) : (
              selectedListing.reviews.map((review, index) => (
                <div key={index} className="border border-gray-300 p-2 mb-2">
                  <div className="flex flex-row justify-between items-center">
                    <h3 className="font-bold text-sm text-gray-700">
                      {review.name}
                    </h3>
                    <div className="flex items-center">
                      <h3 className="font-bold text-sm text-gray-700">
                        {review.rating}
                      </h3>
                      <FaStar className="ml-1" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{review.message}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(review.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="my-4 pb-20">
          <h2 className="text-lg font-bold mb-2 text-custom-orange">
            Listed By
          </h2>
          <div className="flex flex-wrap">
            {listingUser ? (
              <div className="flex items-center space-x-6 my-4">
                <Image
                  src={
                    (listingUser && listingUser.pfp) ||
                    "/assets/icons/profile.svg"
                  }
                  alt="Listing Image"
                  className="rounded-full"
                  width={80}
                  height={80}
                />
                <h2 className="text-2xl font-bold">{listingUser.first_name}</h2>
              </div>
            ) : (
              <div className="flex items-center space-x-6 my-4">
                <Loading width={40} height={40} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-row justify-between items-center p-4 bg-white">
        <div className="font-bold text-2xl text-gray-500">
          $
          {isCasual
            ? `${selectedListing.hourly_rate}/hr`
            : `${selectedListing.monthly_rate}/mth`}
        </div>
        <div>
          <button
            className="bg-custom-orange w-60 text-white rounded-full p-2"
            onClick={() => (user ? setIsBooking(true) : router.push("/login"))}
          >
            Book for $
            {isCasual
              ? calculateTotalPrice(
                  selectedListing.hourly_rate,
                  startDate,
                  endDate,
                  startTime,
                  endTime
                )
              : selectedListing.monthly_rate}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
