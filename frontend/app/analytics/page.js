"use client";

import LoginSideBar from "@components/LoginSideBar";
import { useUser } from "@contexts/UserProvider";
import { AuthRequiredError } from "@errors/exceptions";
import { analyticsData, makeRequest } from "@utils/utils";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  Label,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Analytics = () => {
  const { user } = useUser();
  const [Analytics, setAnalytics] = useState(analyticsData);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const response = await makeRequest("/user/analytics", "GET");
      if (response.error) {
        throw new Error(response.error);
      } else {
        setAnalytics(analyticsData);
      }
    };
    fetchAnalytics();
  }, []);

  if (!user) {
    throw new AuthRequiredError();
  }

  const dataWithIndex = Analytics.bookings_per_listing.map((item, index) => ({
    ...item,
    index: index + 1, // Add 1 to start the index from 1 instead of 0
  }));

  return (
    <div className="flex flex-row w-full mt-12">
      <div className="rounded-lg p-5">
        <LoginSideBar />
      </div>
      <div
        className="flex flex-col w-full justify-between ml-5 p-5 bg-white shadow-md rounded-lg"
        style={{ height: "70vh" }}
      >
        <div className="flex flex-col w-full">
          <div className="flex flex-row justify-between w-full mb-5">
            <h1 className="heading_text text-3xl text-gray-700">Analytics</h1>
          </div>
          <div className="flex flex-row justify-between space-x-10">
            <div className="w-1/2">
              <h2 className="mb-4 text-2xl text-gray-700">Monthly Revenue</h2>
              {Analytics && Analytics.monthly_revenue && (
                <LineChart
                  width={400}
                  height={300}
                  data={Analytics.monthly_revenue}
                >
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="month">
                    <Label value="Month" offset={-5} position="insideBottom" />
                  </XAxis>
                  <YAxis>
                    <Label value="Revenue" angle={-90} position="insideLeft" />
                  </YAxis>
                  <Tooltip />
                </LineChart>
              )}
            </div>
            <div className="w-1/2">
              <h2 className="mb-4 text-2xl text-gray-700">
                Bookings per Listing
              </h2>
              {Analytics && Analytics.bookings_per_listing && (
                <BarChart width={400} height={300} data={dataWithIndex}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index">
                    <Label
                      value="Listing Index"
                      offset={-1}
                      position="insideBottom"
                    />
                  </XAxis>
                  <YAxis>
                    <Label value="Bookings" angle={-90} position="insideLeft" />
                  </YAxis>
                  <Tooltip
                    formatter={(value, name, props) => {
                      // eslint-disable-next-line react/prop-types
                      const { payload } = props;
                      // eslint-disable-next-line react/prop-types
                      return [
                        value,
                        // eslint-disable-next-line react/prop-types
                        `Address: ${payload.address.formatted_address}`,
                      ];
                    }}
                  />
                  <Bar dataKey="bookings" fill="#8884d8">
                    {Analytics.bookings_per_listing.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </div>
          </div>
          <div>
            {Analytics && Analytics.total_bookings && (
              <div
                className="mt-10 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4"
                role="alert"
              >
                <p className="font-bold">Total Bookings</p>
                <p>{Analytics.total_bookings}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
