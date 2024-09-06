"use client";

import LoginSideBar from "@components/LoginSideBar";
import { useUser } from "@contexts/UserProvider";
import { AuthRequiredError } from "@errors/exceptions";
import { makeRequest } from "@utils/utils";
import { useEffect, useState } from "react";
import { Button, Card } from "flowbite-react";
import { FaCar, FaClock, FaMoneyBillWave, FaTrash } from "react-icons/fa";
import Loading from "@components/Loading";

const AdminPage = () => {
  const { user, fetchUser } = useUser();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log(user);

  useEffect(() => {
    const getListings = async () => {
      setLoading(true);
      const response = await makeRequest("/listings", "GET");
      if (response.error) {
        throw new Error(response.error);
      } else {
        setListings(response.listings);
      }
      setLoading(false);
    };
    getListings();
  }, []);

  const formatTime = (time) => {
    if (time === 0) return "12:00 AM";
    if (time === 12) return "12:00 PM";
    return time < 12 ? `${time}:00 AM` : `${time - 12}:00 PM`;
  };

  if (!user) {
    throw new AuthRequiredError();
  }

  const handleDeleteListing = async (listing) => {
    const response = await makeRequest(`/listings/${listing._id}`, "DELETE");
    if (response.error) {
      throw new Error(response.error);
    } else {
      fetchUser();
    }
  };

  if (!user.is_admin) {
    throw new AuthRequiredError("You are not an admin");
  }

  return (
    <div className="flex flex-row w-full mt-12">
      <div className="rounded-lg p-5">
        <LoginSideBar />
      </div>
      <div
        className="flex flex-col w-full justify-between ml-5 p-5 bg-white shadow-md rounded-lg"
        style={{ height: "70vh" }}
      >
        <div className="flex flex-col w-full">
          <div className="flex flex-row justify-between w-full mb-5">
            <h1 className="heading_text text-3xl text-gray-700">Admin</h1>
          </div>
          {loading ? (
            <div className="w-full flex-center">
              <Loading width={50} height={50} />
            </div>
          ) : listings.length > 0 ? (
            listings.map((listing, index) => (
              <Card
                key={index}
                className="max-w-full mb-5 p-4 shadow-lg rounded-lg flex flex-col justify-between"
              >
                <div>
                  <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
                    <FaCar className="inline-block mr-2" />
                    {listing.listing_type} - {listing.address.formatted_address}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-200 mb-2">
                    {listing.description}
                  </p>
                </div>

                <div className="flex flex-row justify-between text-sm text-gray-600 dark:text-gray-200 mb-2">
                  <p>Max vehicle size: {listing.max_vehicle_size}</p>
                  <p>
                    <FaClock className="inline-block mr-2" />
                    {listing.availability.is_24_7
                      ? "24/7"
                      : `${formatTime(
                          listing.availability.start_time
                        )} - ${formatTime(listing.availability.end_time)}`}
                  </p>
                </div>

                <div className="flex flex-row justify-between text-sm text-gray-600 dark:text-gray-200 mb-2">
                  {listing.casual_booking && (
                    <p>
                      <FaMoneyBillWave className="inline-block mr-2" /> Hourly
                      rate: ${listing.pricing.hourly_rate}
                    </p>
                  )}
                  {listing.monthly_booking && (
                    <p>
                      <FaMoneyBillWave className="inline-block mr-2" /> Monthly
                      rate: ${listing.pricing.monthly_rate}
                    </p>
                  )}
                </div>

                <div className="flex gap-4 mt-4">
                  <Button
                    className="bg-custom-orange"
                    onClick={() => handleDeleteListing(listing)}
                  >
                    <FaTrash className="inline-block mr-2" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-xl text-gray-500">No listings to display</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
