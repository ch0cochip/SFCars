import Link from "next/link";
import Image from "next/image";
import { useUser } from "@contexts/UserProvider";

const LoginSidebar = () => {
  const { user } = useUser();

  return (
    <div className="flex flex-col shrink-1 w-64 h-full bg-white p-5 rounded-3xl shadow-md gap-6">
      <div className="flex flex-row justify-between">
        <div className="w-1/3">
          <Image
            src="/assets/icons/profile.svg"
            alt="Profile"
            width={50}
            height={50}
            className="object-contain"
          />
        </div>
        <div className="w-2/3 mt-2">
          <p className="text-lg text-gray-800">
            {user.first_name + " " + user.last_name}
          </p>
        </div>
      </div>

      <div>
        <ul className="flex flex-col gap-1">
          <li>
            <Link href="/profile">
              <p className="flex py-1 text-lg text-gray-800 hover:underline">
                Profile
              </p>
            </Link>
          </li>
          {user.is_admin && (
            <li>
              <Link href="/admin">
                <p className="flex py-1 text-lg text-gray-800 hover:underline">
                  Admin
                </p>
              </Link>
            </li>
          )}
          <li>
            <Link href="/analytics">
              <p className="flex py-1 text-lg text-gray-800 hover:underline">
                Analytics
              </p>
            </Link>
          </li>
          <li>
            <Link href="/inbox">
              <p className="flex py-1 text-lg text-gray-800 hover:underline">
                Inbox
              </p>
            </Link>
          </li>
          <li>
            <Link href="/">
              <p className="flex py-1 text-lg text-gray-800 hover:underline">
                Find a Spot
              </p>
            </Link>
          </li>
          <li>
            <Link href="/manage-bookings">
              <p className="flex py-1 text-lg text-gray-800 hover:underline">
                Manage Bookings
              </p>
            </Link>
          </li>
          <li>
            <Link href="/listings">
              <p className="flex py-1 text-lg text-gray-800 hover:underline">
                Manage Listings
              </p>
            </Link>
          </li>
          <li>
            <Link href="/wallet">
              <p className="flex py-1 text-lg text-gray-800 hover:underline">
                Wallet
              </p>
            </Link>
          </li>
          <li>
            <Link href="/help">
              <p className="flex py-1 text-lg text-gray-800 hover:underline">
                Help
              </p>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LoginSidebar;
