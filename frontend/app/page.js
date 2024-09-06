"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import SearchBar from "@components/SearchBar";
import { useRouter, useSearchParams } from "next/navigation";

const Home = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const onSearch = (addressData) => {
    if (addressData) {
      router.push(
        "/search" +
          "?" +
          createQueryString("address", addressData.formatted_address) +
          "&" +
          createQueryString("lat", addressData.lat) +
          "&" +
          createQueryString("lng", addressData.lng)
      );
    }
  };

  return (
    <div className="flex flex-col justify-between items-center mt-10">
      <div
        className="flex justify-between items-center w-full"
        style={{ height: "40vh" }}
      >
        <div className="flex flex-col items-start gap-4 mr-44 w-full">
          <div className="flex flex-col items-start">
            <p className="landing_page_text">ACCOMPANY YOUR</p>
            <p className="landing_page_text">JOURNEY WITH COMFORT</p>
          </div>
          <label className="text-md text-gray-400">
            Car rent services for various terrain with guaranteed quality
          </label>
          <div className="w-full mt-4 relative">
            <SearchBar
              onSearch={onSearch}
              placeholder="Search Address"
              className="border border-transparent w-full h-12 px-3 rounded-full shadow-md text-base outline-none overflow-ellipsis overflow-hidden whitespace-nowrap absolute left-1/2 transform -translate-x-1/2 placeholder-black-400"
              showSearchButton={true}
            />
          </div>
        </div>

        <div className="flex flex-col image-container">
          <Image
            src="/assets/images/sport-car.png"
            alt="sport-car"
            width={550}
            height={550}
            className="object-contain ml-48"
            priority={true}
          />
        </div>

        <div className="flex flex-col mr-24 mt-20">
          <Image
            src="/assets/images/ornament.png"
            alt="ornament"
            width={1200}
            height={1200}
            priority={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
