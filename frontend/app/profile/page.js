"use client";

import { useState, useRef } from "react";
import LoginSideBar from "@components/LoginSideBar";
import Image from "next/image";
import { useRouter } from "next/navigation";
import EditProfileModal from "@components/EditProfileModal";
import { useUser } from "@contexts/UserProvider";
import { AuthRequiredError } from "@errors/exceptions";
import { fileToDataUrl } from "@utils/utils";

const ProfilePage = () => {
  const { user, updateUser } = useUser();
  const router = useRouter();
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const hiddenFileInput = useRef(null);

  const handleVehicleDetails = () => {
    router.push("/vehicle-details");
  };

  const handlePaymentDetails = () => {
    router.push("/payment-details");
  };

  if (!user) {
    throw new AuthRequiredError();
  }

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    const dataUrl = await fileToDataUrl(file);
    const body = {
      pfp: dataUrl,
    };
    updateUser(body);
  };

  const handleClickChangePhoto = () => {
    // Programmatically click the hidden file input
    hiddenFileInput.current.click();
  };

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
            <h1 className="heading_text text-3xl text-gray-700">Profile</h1>
            <EditProfileModal
              showEditProfileModal={showEditProfileModal}
              setShowEditProfileModal={setShowEditProfileModal}
            />
          </div>
          <div className="flex flex-row gap-20">
            <div className="w-40 h-40 rounded-full bg-gray-300 cursor-pointer relative hover:bg-gray-400 transition duration-200">
              <Image
                src={user.pfp || "/assets/icons/profile.svg"}
                alt="Profile"
                width={160}
                height={160}
                className="w-40 h-40 rounded-full"
              />
              <button
                onClick={handleClickChangePhoto}
                className="absolute bg-blue-500 text-white py-1 px-2 rounded-md transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 opacity-0 hover:opacity-100 transition-opacity duration-200"
              >
                Change Photo
              </button>
              <input
                ref={hiddenFileInput}
                onChange={handleImageChange}
                type="file"
                accept="image/*"
                className="hidden"
              />
            </div>
            <div className="flex flex-col justify-between w-4/5">
              <div>
                <span className="text-2xl font-bold text-gray-700">Name:</span>{" "}
                <span className="text-2xl text-gray-500">
                  {user.first_name + " " + user.last_name}
                </span>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-700">Email:</span>{" "}
                <span className="text-2xl text-gray-500">{user.email}</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-700">
                  Phone Number:
                </span>{" "}
                <span className="text-2xl text-gray-500">
                  {user.phone_number}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full justify-between gap-6 mt-10">
          <div
            onClick={handleVehicleDetails}
            className="cursor-pointer flex flex-row w-full gap-4 p-5 bg-blue-100 rounded-lg shadow-inner"
          >
            <div>
              <Image
                src="/assets/images/vehicle.png"
                alt="Vehicle"
                width={50}
                height={50}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-lg font-bold text-blue-600">
                Vehicle Details
              </div>
              <div className="text-sm text-blue-500">
                Add the details of the vehicles you want to park
              </div>
            </div>
          </div>
          <div
            onClick={handlePaymentDetails}
            className="cursor-pointer flex flex-row w-full gap-4 p-5 bg-green-100 rounded-lg shadow-inner"
          >
            <div>
              <Image
                src="/assets/images/payment.png"
                alt="Payment"
                width={50}
                height={50}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-lg font-bold text-green-600">
                Payment Details
              </div>
              <div className="text-sm text-green-500">
                Add the details of the payment method you want to use
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
