"use client";

import "@styles/globals.css";

import { LoadScript } from "@react-google-maps/api";
import { Navbar } from "@components/Navbar";
import UserProvider from "@contexts/UserProvider";
import PropTypes from "prop-types";

const libraries = ["places"];

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background">
        <UserProvider>
          <LoadScript
            googleMapsApiKey="AIzaSyCVQPHCJyr4-2YZnZsb8-BYJUum-QMeL58"
            libraries={libraries}
          >
            <main className="app">
              <Navbar />
              {children}
            </main>
          </LoadScript>
        </UserProvider>
      </body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
