import React from "react";
import Link from "next/link";

export const Sidebar = () => {
  return (
    <div className="flex shrink-1 w-64 h-96 bg-white p-10 rounded-3xl shadow-md">
      <ul className="flex flex-col gap-4">
        <li>
          <Link href="/login">
            <p className="flex py-1 text-3xl text-gray-800 hover:underline">
              Login
            </p>
          </Link>
        </li>
        <li>
          <Link href="/register">
            <p className="flex py-1 text-3xl text-gray-800 hover:underline">
              Sign Up
            </p>
          </Link>
        </li>
        <li>
          <Link href="/help">
            <p className="flex py-1 text-3xl text-gray-800 hover:underline">
              Help
            </p>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
