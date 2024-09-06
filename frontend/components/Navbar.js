"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useUser } from "@contexts/UserProvider";
import Loading from "@components/Loading";

export const Navbar = () => {
  const { user, logout, loading } = useUser();
  const [toggleDropdown, setToggleDropdown] = useState(false);

  return (
    <header className="w-full mb-16 pt-3 h-14">
      <div className="border-b border-gray-300 pb-2">
        <div className="flex-between">
          <div className="flex gap-8">
            <div className="flex gap-1 items-center">
              <Image
                src="/assets/icons/Call.svg"
                alt="call"
                width={30}
                height={30}
                className="object-contain"
              />
              <p className="text-md">+61 234 567 890</p>
            </div>
            <div className="flex gap-2 items-center">
              <Image
                src="/assets/icons/Email.svg"
                alt="email"
                width={30}
                height={30}
                className="object-contain"
              />
              <p className="text-md">sfcars@support.com</p>
            </div>
          </div>
          <div className="flex gap-8">
            <Link href="/about">
              <p className="cursor-pointer hover:underline hover:text-orange-500 text-xl">
                About
              </p>
            </Link>
            <Link href={user ? "/listings" : "/login"}>
              <p className="cursor-pointer hover:underline hover:text-orange-500 text-xl">
                List Your Spot
              </p>
            </Link>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <Link href="/">
          <div className="flex gap-2 flex-center cursor-pointer">
            <Image
              src="/assets/icons/Logo.svg"
              alt="logo"
              width={60}
              height={60}
              className="object-contain"
            />
            <p className="logo_text">SFCars</p>
          </div>
        </Link>
        {loading ? (
          <div className="relative inline-block text-left">
            <Loading width={30} height={30} />
          </div>
        ) : user ? (
          <div
            className="relative inline-block text-left"
            onMouseEnter={() => setToggleDropdown(true)}
            onMouseLeave={() => setToggleDropdown(false)}
          >
            <div>
              <button
                type="button"
                className="inline-flex justify-center rounded-md bg-background px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 gap-x-2 hover:bg-gray-300 transition-colors duration-200"
                id="menu-button"
                aria-expanded="true"
                aria-haspopup="true"
              >
                {user.first_name} {user.last_name}
                <Image
                  src="/assets/icons/profile.svg"
                  width={20}
                  height={20}
                  alt="profile"
                  className="object-contain"
                />
              </button>
            </div>

            {toggleDropdown && (
              <div
                className="absolute right-0 z-10 mt-0 w-56 origin-top-right rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="menu-button"
                tabIndex="-1"
              >
                <div className="py-1" role="none">
                  <Link href="/profile">
                    <p
                      className="text-gray-700 block px-4 py-2 text-sm cursor-pointer"
                      role="menuitem"
                      tabIndex="-1"
                      id="menu-item-0"
                      onClick={() => setToggleDropdown(false)}
                    >
                      Profile
                    </p>
                  </Link>
                  {user.is_admin && (
                    <Link href="/admin">
                      <p
                        className="text-gray-700 block px-4 py-2 text-sm cursor-pointer"
                        role="menuitem"
                        tabIndex="-1"
                        id="menu-item-0"
                        onClick={() => setToggleDropdown(false)}
                      >
                        Admin
                      </p>
                    </Link>
                  )}
                  <Link href="/analytics">
                    <p
                      className="text-gray-700 block px-4 py-2 text-sm cursor-pointer"
                      role="menuitem"
                      tabIndex="-1"
                      id="menu-item-0"
                      onClick={() => setToggleDropdown(false)}
                    >
                      Analytics
                    </p>
                  </Link>
                  <Link href="/inbox">
                    <p
                      className="text-gray-700 block px-4 py-2 text-sm cursor-pointer"
                      role="menuitem"
                      tabIndex="-1"
                      id="menu-item-1"
                      onClick={() => setToggleDropdown(false)}
                    >
                      Inbox
                    </p>
                  </Link>
                  <Link href="/">
                    <p
                      className="text-gray-700 block px-4 py-2 text-sm cursor-pointer"
                      role="menuitem"
                      tabIndex="-1"
                      id="menu-item-1"
                      onClick={() => setToggleDropdown(false)}
                    >
                      Find a Spot
                    </p>
                  </Link>
                  <Link href="/manage-bookings">
                    <p
                      className="text-gray-700 block px-4 py-2 text-sm cursor-pointer"
                      role="menuitem"
                      tabIndex="-1"
                      id="menu-item-1"
                      onClick={() => setToggleDropdown(false)}
                    >
                      Manage Bookings
                    </p>
                  </Link>
                  <Link href="/listings">
                    <p
                      className="text-gray-700 block px-4 py-2 text-sm cursor-pointer"
                      role="menuitem"
                      tabIndex="-1"
                      id="menu-item-1"
                      onClick={() => setToggleDropdown(false)}
                    >
                      Manage Listings
                    </p>
                  </Link>
                  <Link href="/wallet">
                    <p
                      className="text-gray-700 block px-4 py-2 text-sm cursor-pointer"
                      role="menuitem"
                      tabIndex="-1"
                      id="menu-item-1"
                      onClick={() => setToggleDropdown(false)}
                    >
                      Wallet
                    </p>
                  </Link>
                  <Link href="/help">
                    <p
                      className="text-gray-700 block px-4 py-2 text-sm cursor-pointer"
                      role="menuitem"
                      tabIndex="-1"
                      id="menu-item-1"
                      onClick={() => setToggleDropdown(false)}
                    >
                      Help
                    </p>
                  </Link>
                  <button
                    type="button"
                    className="text-gray-700 block w-full px-4 py-2 text-sm cursor-pointer"
                    role="menuitem"
                    tabIndex="-1"
                    id="menu-item-3"
                    onClick={() => {
                      setToggleDropdown(false);
                      logout();
                    }}
                  >
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-4">
            <Link href="/login">
              <button className="orange_btn">Login</button>
            </Link>
            <Link href="/register">
              <button className="orange_btn">Register</button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
