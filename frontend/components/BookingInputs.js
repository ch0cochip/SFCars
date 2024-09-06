import SearchBar from "@components/SearchBar";
import TimePicker from "@components/TimePicker";
import { useSearchParams } from "next/navigation";
import { useContext } from "react";
import SearchContext from "@contexts/SearchContext";

const BookingInputs = () => {
  const searchParams = useSearchParams();
  const {
    isCasual,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    minStartTime,
    startTime,
    setStartTime,
    minEndTime,
    endTime,
    setEndTime,
    setSort,
    setAddressData,
  } = useContext(SearchContext);

  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

  const twoWeeksFromStartDay = new Date(startDate);
  twoWeeksFromStartDay.setDate(twoWeeksFromStartDay.getDate() + 14);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="font-bold text-sm text-gray-500 mb-1">
          Find Parking Near
        </h2>
        <SearchBar
          placeholder="Search Address"
          onSearch={(data) => data && setAddressData(data)}
          className="border w-full text-base placeholder-black"
          showSearchButton={false}
          initialValue={searchParams.get("address")}
        />
      </div>
      {!isCasual ? (
        <>
          <div className="flex justify-between space-x-4 mb-4 pr-4">
            <div className="w-1/2">
              <h3 className="font-bold text-sm text-gray-500 mb-1">
                Monthly Parking Starting
              </h3>
              <input
                type="date"
                id="start"
                name="trip-start"
                value={formatDate(startDate)}
                min={formatDate(new Date())}
                max={formatDate(sixMonthsFromNow)}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                className="border w-full text-base placeholder-black"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between space-x-4 mb-4 pr-4">
            <div className="w-1/2">
              <h3 className="font-bold text-sm text-gray-500 mb-1">Start</h3>
              <input
                type="date"
                id="start"
                name="trip-start"
                value={formatDate(startDate)}
                min={formatDate(new Date())}
                max={formatDate(sixMonthsFromNow)}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                className="border w-full text-base placeholder-black"
              />
            </div>
            <div className="w-1/2">
              <h3 className="font-bold text-sm text-gray-500 mb-1">End</h3>
              <input
                type="date"
                id="end"
                name="trip-end"
                value={formatDate(endDate)}
                min={formatDate(startDate)}
                max={formatDate(twoWeeksFromStartDay)}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                className="border w-full text-base placeholder-black"
              />
            </div>
          </div>
          <div className="flex justify-between space-x-4 mb-4 pr-4">
            <div className="w-1/2">
              <TimePicker
                minTime={minStartTime}
                maxTime={24}
                value={startTime}
                onChange={setStartTime}
              />
            </div>
            <div className="w-1/2">
              <TimePicker
                minTime={minEndTime}
                maxTime={24}
                value={endTime}
                onChange={setEndTime}
              />
            </div>
          </div>
        </>
      )}
      <div className="mb-4">
        <h3 className="font-bold text-sm text-gray-500 mb-2">Sort By</h3>
        <select
          className="border p-2 w-full"
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="distance">Sort By Distance</option>
          <option value="price">Sort By Price</option>
        </select>
      </div>
    </div>
  );
};

export default BookingInputs;
