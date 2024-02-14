import Footer from "@/components/footer";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { FaChevronRight } from "react-icons/fa";

export default function Home() {
  return (
    <section
      id="home-section"
      className="w-full min-h-screen flex items-center justify-center flex-col group">
      <div className="flex gap-2 items-center flex-col">
        <Image
          className="group-active:rotate-12 transition-transform animate-in fade-in-0 zoom-in-0"
          src="/pomoflow-logo.svg"
          alt="hi there"
          width={128}
          height={128}
        />
        <div className="px-2 py-0.5 rounded-full text-pomo bg-transparent border-2 border-pomo text-[0.6rem]">
          Beta
        </div>

        <h1 className="text-5xl font-medium">Pomoflow</h1>
        <p className="">Stay in focus. Together.</p>
      </div>

      <div className="mt-8">
        <Link href={"/dash"}>
          <div className="relative">
            <button
              className={cn(
                "px-6 py-2 text-sm rounded-lg h-10 group bg-pomo z-10",
                "text-black border-2 border-pomo transition",
                "flex items-center gap-2 justify-center",
                "hover:brightness-90",
                "hover:translate-x-1 hover:-translate-y-1 relative active:translate-y-0 active:translate-x-0"
              )}>
              <span className="text-sm">Get Started</span>

              <FaChevronRight
                size={16}
                className="group-hover:translate-x-2 transition-transform"
              />
            </button>

            <div className="absolute inset-0 rounded-lg bg-pomo brightness-50 group-hover:opacity-100 z-0" />
          </div>
        </Link>
      </div>
      <Footer />
    </section>
  );
}
