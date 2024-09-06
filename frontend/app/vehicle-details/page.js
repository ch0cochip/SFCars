"use client";

import { useState, useEffect } from "react";
import { useUser } from "@contexts/UserProvider";
import LoginSideBar from "@components/LoginSideBar";
import VehicleDetailsModal from "@components/VehicleDetailsModal";
import { Button, Card } from "flowbite-react";
import { useRouter } from "next/navigation";
import { AuthRequiredError } from "@errors/exceptions";
import Image from "next/image";

const VehicleDetails = () => {
  const router = useRouter();
  const { user, updateUser, loading } = useUser();
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showVehicleDetailsModal, setShowVehicleDetailsModal] = useState(
    user.vehicle_details.map(() => false)
  );

  if (!user) {
    throw new AuthRequiredError();
  }

  useEffect(() => {
    setShowVehicleDetailsModal(user.vehicle_details.map(() => false));
  }, [user.vehicle_details]);

  const handleDeleteVehicle = async (vehicle) => {
    const body = {
      vehicle_details: user.vehicle_details.filter(
        (v) => v.registration_number !== vehicle.registration_number
      ),
    };
    updateUser(body);
  };

  return (
    <div className="flex flex-row w-full mt-12">
      <div className="rounded-lg p-5">
        <LoginSideBar />
      </div>
      <div
        className="flex flex-col w-full justify-between ml-5 p-5 bg-white shadow-md rounded-lg overflow-auto"
        style={{ height: "70vh" }}
      >
        <div className="flex flex-col w-full">
          <div className="flex flex-row justify-between w-full mb-5">
            <h1 className="heading_text text-3xl text-gray-700">My Vehicles</h1>
            <div className="flex flex-row gap-4 ">
              <Button
                className="bg-custom-orange"
                onClick={() => router.push("/profile")}
              >
                Back to Profile
              </Button>
              <VehicleDetailsModal
                showVehicleDetailsModal={showAddVehicleModal}
                setShowVehicleDetailsModal={setShowAddVehicleModal}
                btnTitle={"Add Vehicle"}
                modalHeader={"Add Vehicle Details"}
                registration={""}
                type={""}
                make={""}
                model={""}
                isEdit={false}
              />
            </div>
          </div>
          {loading ? (
            <div className="w-full flex-center">
              <Image
                src="assets/icons/loader.svg"
                width={50}
                height={50}
                alt="loader"
                className="object-contain"
              />
            </div>
          ) : user.vehicle_details.length > 0 ? (
            user.vehicle_details.map((vehicle, index) => (
              <Card key={index} className="max-w-full mb-5">
                <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {vehicle.vehicle_make} {vehicle.vehicle_model}
                </h5>
                <p className="font-normal text-gray-700 dark:text-gray-400">
                  Registration Number: {vehicle.registration_number}
                </p>
                <p className="font-normal text-gray-700 dark:text-gray-400">
                  Vehicle Type: {vehicle.vehicle_type}
                </p>

                <div className="flex gap-4 flex-end">
                  <VehicleDetailsModal
                    showVehicleDetailsModal={showVehicleDetailsModal[index]}
                    setShowVehicleDetailsModal={(value) => {
                      const newShowVehicleDetailsModal = [
                        ...showVehicleDetailsModal,
                      ];
                      newShowVehicleDetailsModal[index] = value;
                      setShowVehicleDetailsModal(newShowVehicleDetailsModal);
                    }}
                    btnTitle={"Edit"}
                    modalHeader={"Edit Vehicle Details"}
                    registration={vehicle.registration_number}
                    type={vehicle.vehicle_type}
                    make={vehicle.vehicle_make}
                    model={vehicle.vehicle_model}
                    isEdit={true}
                  />
                  <Button
                    className="bg-custom-orange"
                    onClick={() => handleDeleteVehicle(vehicle)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-xl text-gray-500">
              No vehicle details added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
