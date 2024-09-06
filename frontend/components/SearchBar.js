"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Autocomplete } from "@react-google-maps/api";
import Image from "next/image";
import PropTypes from "prop-types";

function SearchBar({
  placeholder,
  onSearch,
  className,
  showSearchButton,
  initialValue,
}) {
  const [autocomplete, setAutocomplete] = useState(null);
  const autocompleteRef = useRef(null);

  const onLoad = useCallback((autocomplete) => {
    setAutocomplete(autocomplete);
  }, []);

  useEffect(() => {
    if (initialValue && autocompleteRef.current) {
      autocompleteRef.current.value = initialValue;
    }
  }, [initialValue]);

  const getPlaceData = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();

      if (!place) {
        return;
      }

      let streetNumber = "";
      let street = "";
      let city = "";
      let state = "";
      let postcode = "";
      let country = "";

      for (const component of place.address_components) {
        const componentType = component.types[0];

        switch (componentType) {
          case "street_number": {
            streetNumber = component.long_name;
            break;
          }
          case "route": {
            street = component.long_name;
            break;
          }
          case "locality": {
            city = component.long_name;
            break;
          }
          case "administrative_area_level_1": {
            state = component.short_name;
            break;
          }
          case "postal_code": {
            postcode = component.long_name;
            break;
          }
          case "country": {
            country = component.long_name;
            break;
          }
        }
      }

      return {
        formatted_address: place.formatted_address,
        street_number: streetNumber,
        street,
        city,
        state,
        postcode,
        country,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        place_id: place.place_id,
      };
    } else {
      console.log("Autocomplete is not loaded yet!");
    }
  };

  const onPlaceChanged = () => {
    if (!showSearchButton) {
      const placeData = getPlaceData();
      if (placeData && onSearch) {
        onSearch(placeData);
      }
    }
  };

  const searchClick = () => {
    if (showSearchButton) {
      const placeData = getPlaceData();
      if (placeData && onSearch) {
        onSearch(placeData);
      }
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center relative">
        <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
          <input
            ref={autocompleteRef}
            type="text"
            placeholder={placeholder}
            className={`${className} pr-40`}
            defaultValue={initialValue}
          />
        </Autocomplete>
        {showSearchButton && (
          <button
            type="submit"
            className="absolute right-0 mt-1 mr-1 transform rounded-full bg-custom-orange w-10 h-10 flex items-center justify-center"
            style={{ top: "50%", zIndex: 10 }}
            onClick={searchClick}
          >
            <Image
              src="/assets/images/search.png"
              alt="search"
              width={20}
              height={20}
            />
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;

SearchBar.propTypes = {
  placeholder: PropTypes.string.isRequired,
  onSearch: PropTypes.func.isRequired,
  className: PropTypes.string.isRequired,
  showSearchButton: PropTypes.bool.isRequired,
  initialValue: PropTypes.string,
};
