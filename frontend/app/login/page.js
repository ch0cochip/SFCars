"use client";

import React from "react";
import Sidebar from "@components/Sidebar";
import Link from "next/link";
import { useState } from "react";
import { useUser } from "@contexts/UserProvider";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { login } = useUser();
  const validateLogin = async () => {
    let isEmailExist = !!email;
    setEmailError(isEmailExist ? "" : "This field is required");

    let isPasswordExist = !!password;
    setPasswordError(isPasswordExist ? "" : "This field is required");

    if (isEmailExist && isPasswordExist) {
      const body = {
        email: email,
        password: password,
      };
      login(body, setEmailError);
    }
  };

  return (
    <div className="flex flex-row w-full justify-between mt-12">
      <div className="w-1/3">
        <Sidebar />
      </div>
      <div className="flex flex-col w-2/3">
        <h1 className="heading_text">Login</h1>

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

        <label htmlFor="password" className="mb-2">
          Password:
          <div className="mb-2">
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

        <Link
          id="forgotPassword"
          className="mb-20 text-teal-400 text-xs align-content: flex-start"
          href="/login/forgotpassword"
        >
          Forgot password?
        </Link>

        <div className="flex w-96 justify-between">
          <Link href="/">
            <button className="blue_btn">Back</button>
          </Link>
          <div>
            <button className="blue_btn" onClick={() => validateLogin()}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
