"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";
import { IoArrowBackOutline } from "react-icons/io5";

const Page: React.FC = () => {
  const router = useRouter();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {/* A big title saying 404, and a button to return home */}
      <div className="flex flex-col text-center">
        <h1 className="text-8xl">404</h1>
        <p className="text-2xl">Ahoy there cowboy! You seem lost.</p>
        <Button
          variant="link"
          className="mt-4"
          onClick={() => router.push("/dash")}>
          <div className="flex gap-1 items-center justify-center text-center">
            <IoArrowBackOutline />
            Go Home
          </div>
        </Button>
      </div>
    </main>
  );
};

export default Page;
