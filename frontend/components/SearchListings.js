"use client";
import ListingsSideBar from "@components/ListingsSideBar";
import GoogleMaps from "@components/GoogleMaps";
import { useContext, useEffect, useState } from "react";
import SearchContext from "@contexts/SearchContext";
import { getNextHour, calculateDistanceInKm, makeRequest } from "@utils/utils";
import { useSearchParams } from "next/navigation";
import ConfirmListingBookingModal from "@components/ConfirmListingBookingModal";

const SearchListings = () => {
  const searchParams = useSearchParams();
  const {
    isCasual,
    addressData,
    setListings,
    startTime,
    endTime,
    setEndTime,
    startDate,
    endDate,
    setEndDate,
    setMinStartTime,
    setMinEndTime,
    sort,
    fetchingData,
    setFetchingData,
    showConfirmListingBookingModal,
    setShowConfirmListingBookingModal,
  } = useContext(SearchContext);
  const [originalListings, setOriginalListings] = useState([]);

  useEffect(() => {
    if (startDate > endDate) {
      setEndDate(new Date(startDate));
    }

    if (startDate.getDate() != new Date().getDate()) {
      setMinStartTime(0);
    } else {
      setMinStartTime(getNextHour());
    }

    if (endDate.getDate() != new Date().getDate()) {
      setMinEndTime(0);
    } else {
      setMinEndTime(getNextHour() + 1 > 23 ? 0 : getNextHour() + 1);
    }

    if (startDate.getDate() == endDate.getDate() && startTime >= endTime) {
      setEndTime(startTime + 1);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (startTime >= endTime && startDate.getDate() == endDate.getDate()) {
      if (startTime + 1 > 23) {
        setEndTime(0);
        setMinEndTime(0);
        setEndDate(new Date(endDate.setDate(endDate.getDate() + 1)));
      } else {
        setEndTime(startTime + 1);
        setMinEndTime(startTime + 1);
      }
    }
  }, [startTime, endTime]);

  useEffect(() => {
    const fetchData = async () => {
      setFetchingData(true);
      const response = await makeRequest("/listings", "GET");
      if (response.error) {
        throw new Error(response.error);
      } else {
        if (response.listings.length !== 0) {
          setOriginalListings(response.listings);
        }
      }
      setFetchingData(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!fetchingData) {
      let processedListings = [...originalListings];
      if (isCasual) {
        processedListings = processedListings.filter((listing) => {
          if (!listing.hourly_rate) return false;

          if (listing.availability.is_24_7) return true;

          const selectedDays = getDaysArray(
            new Date(startDate),
            new Date(endDate)
          ).map((date) => date.toLocaleString("en-us", { weekday: "long" }));

          const listingDays = listing.availability.available_days;

          const dateIsValid = selectedDays.every((day) => listingDays[day]);

          const startTimeIsValid =
            startTime >= getTime(listing.availability.start_time) &&
            startTime < getTime(listing.availability.end_time);
          const endTimeIsValid =
            endTime > getTime(listing.availability.start_time) &&
            endTime <= getTime(listing.availability.end_time);

          return dateIsValid && startTimeIsValid && endTimeIsValid;
        });
      } else {
        processedListings = processedListings.filter(
          (listing) => listing.monthly_rate
        );
      }

      processedListings.sort((a, b) => {
        switch (sort) {
          case "distance":
            return addressData
              ? calculateDistanceInKm(
                  addressData.lat,
                  addressData.lng,
                  a.address.lat,
                  a.address.lng
                ) -
                  calculateDistanceInKm(
                    addressData.lat,
                    addressData.lng,
                    b.address.lat,
                    b.address.lng
                  )
              : calculateDistanceInKm(
                  searchParams.get("lat"),
                  searchParams.get("lng"),
                  a.address.lat,
                  a.address.lng
                ) -
                  calculateDistanceInKm(
                    searchParams.get("lat"),
                    searchParams.get("lng"),
                    b.address.lat,
                    b.address.lng
                  );
          case "price":
            return isCasual
              ? a.hourly_rate - b.hourly_rate
              : a.monthly_rate - b.monthly_rate;
          default:
            return 0;
        }
      });

      setListings(processedListings);
    }
  }, [
    originalListings,
    isCasual,
    startDate,
    endDate,
    startTime,
    endTime,
    sort,
  ]);

  const getDaysArray = (start, end) => {
    for (
      var arr = [], dt = new Date(start);
      dt <= end;
      dt.setDate(dt.getDate() + 1)
    ) {
      arr.push(new Date(dt));
    }
    return arr;
  };

  const getTime = (timeString) => {
    const time = timeString.split(":");
    return parseInt(time[0]) + parseInt(time[1]) / 60;
  };

  return (
    <div className="relative flex w-full mt-6" style={{ height: "79.8vh" }}>
      <ListingsSideBar />
      <GoogleMaps />
      <ConfirmListingBookingModal
        showConfirmListingBookingModal={showConfirmListingBookingModal}
        setShowConfirmListingBookingModal={setShowConfirmListingBookingModal}
      />
    </div>
  );
};

export default SearchListings;
