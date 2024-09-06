"use client";

import { Button } from "flowbite-react";
import Link from "next/link";

const error = ({ error, reset }) => {
  return (
    <main className="grid min-h-full place-items-center px-6 py-24 sm:px-32 lg:px-8 bg-custom-orange rounded-lg">
      <div className="text-center">
        <p className="text-base font-semibold text-white uppercase tracking-wide">
          There was a problem
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {error.message || "Something went wrong"}
        </h1>
        <p className="mt-6 text-base leading-7 text-white">
          Please try again later or contact support if the problem persists.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button onClick={reset}>Try again</Button>
          <Link href="/">Go back home</Link>
        </div>
      </div>
    </main>
  );
};

export default error;
