"use client";

import React from "react";
import Sidebar from "@components/Sidebar";
import { checkPasswordValidation } from "@utils/utils";
import { useState } from "react";
import { useUser } from "@contexts/UserProvider";

const Register = () => {
  const [showFurtherRegistration, setShowFurtherRegistration] = useState(false);
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailError, setEmailError] = useState("");
  const [confirmEmailError, setConfirmEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");

  const { register } = useUser();

  const validateRegister = () => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    let isEmailExist = !!email;
    let isEmailValid = isEmailExist && emailPattern.test(email);
    setEmailError(
      isEmailExist
        ? isEmailValid
          ? ""
          : "Enter a valid email address"
        : "This field is required"
    );

    let isConfirmEmailExist = !!confirmEmail;
    let areEmailsSame = isConfirmEmailExist && email === confirmEmail;
    setConfirmEmailError(
      isConfirmEmailExist
        ? areEmailsSame
          ? ""
          : "Email addresses do not match"
        : "This field is required"
    );

    let isPasswordExist = !!password;
    const passwordErrorString =
      isPasswordExist && checkPasswordValidation(password);
    let isPasswordValid = isPasswordExist && !passwordErrorString;
    setPasswordError(
      isPasswordExist
        ? isPasswordValid
          ? ""
          : passwordErrorString
        : "This field is required"
    );

    if (isEmailValid && areEmailsSame && isPasswordValid) {
      setShowFurtherRegistration(true);
    }
  };

  const validateFurtherRegistration = async () => {
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

    if (isFirstNameValid && isLastNameValid && isPhoneNumberValid) {
      const body = {
        email: email,
        password: password,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
      };
      register(body, setEmailError, setShowFurtherRegistration);
    }
  };

  return (
    <div className="flex flex-row w-full justify-between mt-12">
      <div className="w-1/3">
        <Sidebar />
      </div>
      {showFurtherRegistration ? (
        <div className="flex flex-col w-2/3">
          <h1 className="heading_text">Further Registration</h1>

          <label htmlFor="firstName" className="mb-2">
            First-Name:
            <div className="mb-10">
              <input
                id="firstName"
                className="w-96 border-2 border-gray-300 rounded-3xl p-2 mt-2"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
              />
              <p className="error_text">{firstNameError}</p>
            </div>
          </label>

          <label htmlFor="lastName" className="mb-2">
            Last-Name:
            <div className="mb-10">
              <input
                id="lastName"
                className="w-96 border-2 border-gray-300 rounded-3xl p-2 mt-2"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
              />
              <p className="error_text">{lastNameError}</p>
            </div>
          </label>

          <label htmlFor="phoneNumber" className="mb-2">
            Phone Number:
            <div className="mb-10">
              <input
                id="phoneNumber"
                className="w-96 border-2 border-gray-300 rounded-3xl p-2 mt-2"
                type="number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0412345678"
              />
              <p className="error_text">{phoneNumberError}</p>
            </div>
          </label>
          <div className="flex justify-between w-96">
            <button
              className="blue_btn"
              onClick={() => setShowFurtherRegistration(false)}
            >
              Back
            </button>
            <button
              className="blue_btn"
              onClick={() => validateFurtherRegistration()}
            >
              Register
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-2/3">
          <h1 className="heading_text">Register</h1>

          <label htmlFor="email" className="mb-2">
            Email-Address:
            <div className="mb-10">
              <input
                id="email"
                className="w-96 border-2 border-gray-300 rounded-3xl p-2 mt-2"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane.doe@email.com"
              />
              <p className="error_text">{emailError}</p>
            </div>
          </label>

          <label htmlFor="confirmEmail" className="mb-2">
            Confirm your Email-Address:
            <div className="mb-10">
              <input
                id="confirmEmail"
                className="w-96 border-2 border-gray-300 rounded-3xl p-2 mt-2"
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="jane.doe@email.com"
              />
              <p className="error_text">{confirmEmailError}</p>
            </div>
          </label>

          <label htmlFor="password" className="mb-2">
            Password:
            <div className="mb-10">
              <input
                id="password"
                className="w-96 border-2 border-gray-300 rounded-3xl p-2 mt-2"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Janedoe@123"
              />
              <p className="error_text">{passwordError}</p>
            </div>
          </label>

          <div className="flex justify-between w-96">
            <button
              className="blue_btn"
              onClick={() => setShowFurtherRegistration(false)}
            >
              Back
            </button>
            <button className="blue_btn" onClick={() => validateRegister()}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
