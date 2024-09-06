"use client";

import { Button, Modal, Label } from "flowbite-react";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@contexts/UserProvider";
import PropTypes from "prop-types";

const EditProfileModal = ({
  showEditProfileModal,
  setShowEditProfileModal,
}) => {
  const { user, updateUser } = useUser();
  const [email, setEmail] = useState(user.email);
  const [firstName, setFirstName] = useState(user.first_name);
  const [lastName, setLastName] = useState(user.last_name);
  const [phoneNumber, setPhoneNumber] = useState(user.phone_number);
  const [emailError, setEmailError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");

  const ref = useRef(null);

  useEffect(() => {
    ref.current = document.body;
  }, []);

  const closeModal = () => {
    setShowEditProfileModal(false);
  };

  const clickSave = async () => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    const isEmailExist = !!email;
    const isEmailValid = isEmailExist && emailPattern.test(email);
    setEmailError(
      isEmailExist
        ? isEmailValid
          ? ""
          : "Enter a valid email address"
        : "This field is required"
    );

    let isFirstNameValid = !!firstName;
    setFirstNameError(isFirstNameValid ? "" : "This field is required");

    let isLastNameValid = !!lastName;
    setLastNameError(isLastNameValid ? "" : "This field is required");

    let isPhoneNumberExist = !!phoneNumber;
    let isPhoneNumberValid =
      isPhoneNumberExist &&
      phoneNumber.length === 10 &&
      phoneNumber.startsWith("04");
    setPhoneNumberError(
      isPhoneNumberExist
        ? isPhoneNumberValid
          ? ""
          : "Enter a valid phone number"
        : "This field is required"
    );

    if (
      isEmailValid &&
      isFirstNameValid &&
      isLastNameValid &&
      isPhoneNumberValid
    ) {
      const body = {
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
      };
      updateUser(body);
      closeModal();
    }
  };

  return (
    <>
      <Button
        className="bg-custom-orange hover:bg-custom-orange-dark text-white"
        onClick={() => setShowEditProfileModal(true)}
      >
        Edit Profile
      </Button>
      <Modal
        show={showEditProfileModal}
        onClose={closeModal}
        root={ref.current}
      >
        <Modal.Header className="bg-custom-orange text-white">
          Edit Profile
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="small" value="Email" />
              </div>
              <input
                id="email"
                className="w-full border-2 border-gray-300 rounded-3xl p-2 mt-2 mb-4"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="error_text">{emailError}</p>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="small" value="First Name" />
              </div>
              <input
                id="firstName"
                className="w-full border-2 border-gray-300 rounded-3xl p-2 mt-2 mb-4"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <p className="error_text">{firstNameError}</p>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="small" value="Last Name" />
              </div>
              <input
                id="lastName"
                className="w-full border-2 border-gray-300 rounded-3xl p-2 mt-2 mb-4"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <p className="error_text">{lastNameError}</p>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="small" value="Phone Number" />
              </div>
              <input
                id="phoneNumber"
                className="w-full border-2 border-gray-300 rounded-3xl p-2 mt-2 mb-4"
                type="number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="error_text">{phoneNumberError}</p>
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
    </>
  );
};

export default EditProfileModal;

EditProfileModal.propTypes = {
  showEditProfileModal: PropTypes.bool.isRequired,
  setShowEditProfileModal: PropTypes.func.isRequired,
};
