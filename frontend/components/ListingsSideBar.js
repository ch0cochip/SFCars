"use client";

import { useContext } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import BookingInputs from "@components/BookingInputs";
import Listings from "@components/Listings";
import ListingDetail from "@components/ListingDetail";
import PaymentDetail from "@components/PaymentDetail";
import SearchContext from "@contexts/SearchContext";

const ListingsSideBar = () => {
  const {
    isCasual,
    setIsCasual,
    selectedListing,
    setSelectedListing,
    isBooking,
    setIsBooking,
  } = useContext(SearchContext);

  return (
    <div className="flex flex-row">
      <div className="flex flex-col pr-2">
        <div className="flex justify-start space-x-4 mb-4 pr-4">
          <button
            className={`font-black text-xl mb-1 hover:text-custom-orange ${
              isCasual ? "text-custom-orange underline" : ""
            }`}
            onClick={() => setIsCasual(true)}
          >
            Casual
          </button>
          <button
            className={`font-black text-xl mb-1 hover:text-custom-orange ${
              !isCasual ? "text-custom-orange underline" : ""
            }`}
            onClick={() => setIsCasual(false)}
          >
            Monthly
          </button>
        </div>
        <BookingInputs />

        <hr className="border-t-2 border-gray-300" />
        <Listings />
      </div>
      {selectedListing && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 30, damping: 10 }}
          className="absolute w-1/3 h-full bg-background rounded z-10 left-95 shadow-2xl drop-shadow-2xl"
        >
          <button
            className="rounded-full p-2 absolute top-4 right-4 hover:bg-gray-200 z-10"
            onClick={() => {
              setSelectedListing(null);
              setIsBooking(false);
            }}
          >
            <Image
              src="/assets/icons/close.svg"
              alt="close"
              width={20}
              height={20}
            />
          </button>
          {!isBooking ? <ListingDetail /> : <PaymentDetail />}
        </motion.div>
      )}
    </div>
  );
};

export default ListingsSideBar;
