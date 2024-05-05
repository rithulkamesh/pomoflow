// import { cn } from "@/lib/utils";
import Image from "next/image";
// import Link from "next/link";
import React from "react";
// import { RxHamburgerMenu } from "react-icons/rx";

const Header: React.FC = () => {
  return (
    <div className="w-screen h-12 m-3 flex justify-between">
      <div className="flex gap-1 justify-center items-center h-full mx-7">
        <Image
          className="group-active:rotate-12 transition-transform animate-in fade-in-0 zoom-in-0"
          src="/pomoflow-logo.svg"
          alt="hi there"
          width={40}
          height={40}
        />
        <div>Pomoflow</div>
      </div>
      {/*
      <div className="h-full items-center justify-center mx-3 md:flex hidden">
        <Link href="/dash">
          <button
            className={cn(
              "px-3 py-1 text-sm rounded-lg group bg-pomo z-10",
              "text-black border-2 border-pomo transition",
              "flex items-center gap-2 justify-center",
              "hover:brightness-90"
            )}>
            <span className="text-sm">Get Started</span>
          </button>
        </Link>
      </div>
      <div className="flex h-full items-center justify-center mx-7 md:hidden">
        <button>
          <RxHamburgerMenu />
        </button>
      </div>
      */}
    </div>
  );
};

export default Header;
