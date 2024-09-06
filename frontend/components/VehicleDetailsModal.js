"use client";

import { Button, Modal, Label } from "flowbite-react";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@contexts/UserProvider";
import PropTypes from "prop-types";

const VehicleDetailsModal = ({
  showVehicleDetailsModal,
  setShowVehicleDetailsModal,
  btnTitle,
  modalHeader,
  registration,
  type,
  make,
  model,
  isEdit,
}) => {
  const [vehicleRegistration, setVehicleRegistration] = useState(registration);
  const [vehicleType, setVehicleType] = useState(type);
  const [vehicleMake, setVehicleMake] = useState(make);
  const [vehicleModel, setVehicleModel] = useState(model);
  const [vehicleRegistrationError, setVehicleRegistrationError] = useState("");
  const [vehicleTypeError, setVehicleTypeError] = useState("");
  const [vehicleMakeError, setVehicleMakeError] = useState("");
  const [vehicleModelError, setVehicleModelError] = useState("");
  const { user, updateUser } = useUser();

  useEffect(() => {
    setVehicleRegistration(registration);
    setVehicleType(type);
    setVehicleMake(make);
    setVehicleModel(model);
  }, [registration, type, make, model, showVehicleDetailsModal]);

  const ref = useRef(null);

  useEffect(() => {
    ref.current = document.body;
  }, []);

  const clickSave = async () => {
    const isVehicleRegistrationExist = !!vehicleRegistration;
    setVehicleRegistrationError(
      isVehicleRegistrationExist ? "" : "This field is required"
    );

    const isVehicleTypeExist = !!vehicleType;
    setVehicleTypeError(isVehicleTypeExist ? "" : "This field is required");

    const isVehicleMakeExist = !!vehicleMake;
    setVehicleMakeError(isVehicleMakeExist ? "" : "This field is required");

    const isVehicleModelExist = !!vehicleModel;
    setVehicleModelError(isVehicleModelExist ? "" : "This field is required");

    if (
      isVehicleRegistrationExist &&
      isVehicleMakeExist &&
      isVehicleModelExist
    ) {
      const newVehicleDetail = {
        registration_number: vehicleRegistration,
        vehicle_type: vehicleType,
        vehicle_make: vehicleMake,
        vehicle_model: vehicleModel,
      };
      const vehicleDetails = user.vehicle_details.filter(
        (v) => v.registration_number !== vehicleRegistration
      );
      const body = {
        vehicle_details: [...vehicleDetails, newVehicleDetail],
      };

      updateUser(body);
      closeModal();
    }
  };

  const closeModal = () => {
    if (!isEdit) {
      setVehicleRegistration("");
      setVehicleType("");
      setVehicleMake("");
      setVehicleModel("");
    }
    setVehicleRegistrationError("");
    setVehicleTypeError("");
    setVehicleMakeError("");
    setVehicleModelError("");
    setShowVehicleDetailsModal(false);
  };

  return (
    <div>
      <Button
        className="bg-custom-orange hover:bg-custom-orange-dark text-white"
        onClick={() => setShowVehicleDetailsModal(true)}
      >
        {btnTitle}
      </Button>
      <Modal
        show={showVehicleDetailsModal}
        onClose={closeModal}
        root={ref.current}
      >
        <Modal.Header className="bg-custom-orange text-white">
          {modalHeader}
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="small" value="Vehicle Registration" />
              </div>
              <input
                id="lastName"
                className="w-full border-2 border-gray-300 rounded-3xl p-2 mt-2 mb-4"
                type="text"
                placeholder="QW89BV"
                value={vehicleRegistration}
                onChange={
                  isEdit
                    ? undefined
                    : (e) => setVehicleRegistration(e.target.value)
                }
              />
              {isEdit && (
                <p className="text-gray-400 text-sm mb-4">
                  You can&apos;t edit vehicle registration number
                </p>
              )}
              <p className="error_text">{vehicleRegistrationError}</p>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="small" value="Vehicle Type" />
              </div>
              <select
                name="vehicles"
                id="vehicles"
                className="border border-gray-300 rounded-full p-2 mr-2 mb-4"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
              >
                <option value="" disabled>
                  Select vehicle type
                </option>
                <option value="Bike">Bike</option>
                <option value="Hatcback">Hatchback</option>
                <option value="Sedan">Sedan</option>
                <option value="4wd/suv">4WD/SUV</option>
                <option value="San">Van</option>
              </select>
              <p className="error_text">{vehicleTypeError}</p>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="small" value="Vehicle Make" />
              </div>
              <input
                id="lastName"
                className="w-full border-2 border-gray-300 rounded-3xl p-2 mt-2 mb-4"
                type="text"
                placeholder="Honda"
                value={vehicleMake}
                onChange={(e) => setVehicleMake(e.target.value)}
              />
              <p className="error_text">{vehicleMakeError}</p>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="small" value="Vehicle Model" />
              </div>
              <input
                id="lastName"
                className="w-full border-2 border-gray-300 rounded-3xl p-2 mt-2 mb-4"
                type="text"
                placeholder="Civic"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
              />
              <p className="error_text">{vehicleModelError}</p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex flex-row justify-end space-x-4">
            <Button
              className="bg-custom-orange hover:bg-custom-orange-dark text-white"
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button
              className="bg-custom-orange hover:bg-custom-orange-dark text-white"
              onClick={clickSave}
            >
              Save
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default VehicleDetailsModal;

VehicleDetailsModal.propTypes = {
  showVehicleDetailsModal: PropTypes.bool.isRequired,
  setShowVehicleDetailsModal: PropTypes.func.isRequired,
  btnTitle: PropTypes.string.isRequired,
  modalHeader: PropTypes.string.isRequired,
  registration: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  make: PropTypes.string.isRequired,
  model: PropTypes.string.isRequired,
  isEdit: PropTypes.bool.isRequired,
};
