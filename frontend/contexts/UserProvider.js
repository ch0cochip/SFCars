"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { makeRequest } from "@utils/utils";
import { useRouter } from "next/navigation";
import PropTypes from "prop-types";
import { AuthRequiredError } from "@errors/exceptions";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  );
  const [loading, setLoading] = useState(true);

  const register = async (body, setEmailError, setShowFurtherRegistration) => {
    const response = await makeRequest("/auth/register/admin", "POST", body);
    if (response.error) {
      setEmailError(response.error);
      setShowFurtherRegistration(false);
    } else {
      localStorage.setItem("token", response.token);
      setToken(response.token);
      router.push("/");
    }
  };

  const login = async (body, setEmailError) => {
    const response = await makeRequest("/auth/login", "POST", body);
    if (response.error) {
      setEmailError(response.error);
    } else {
      localStorage.setItem("token", response.token);
      setToken(response.token);
      router.push("/");
    }
  };

  const logout = () => {
    router.push("/");
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const fetchUser = async () => {
    if (token) {
      const response = await makeRequest("/user/profile", "GET");
      if (response.error) {
        throw new AuthRequiredError();
      } else {
        setUser(response);
      }
    }
    setLoading(false);
  };

  const updateUser = async (body) => {
    const result = await makeRequest("/user/profile", "PUT", body);
    if (result.error) {
      throw new Error(result.error);
    } else {
      fetchUser();
    }
  };

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [token]);

  return (
    <UserContext.Provider
      value={{ user, register, login, logout, updateUser, fetchUser, loading }}
    >
      {!loading && children}
    </UserContext.Provider>
  );
};

export default UserProvider;

export const useUser = () => useContext(UserContext);

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
