import ThemeSwitcher from "@/components/theme/theme-switcher";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { IoArrowBack } from "react-icons/io5";

const BlogHeader: React.FC = () => {
  return (
    <div className="flex justify-between w-full">
      <div className="flex items-center gap-2">
        <Image
          src={"/pomoflow-logo.svg"}
          width={50}
          height={50}
          alt="pomoflow logo"
        />
        <div className="px-2 py-0.5 rounded-full text-black bg-pomo text-[0.6rem]">
          Beta
        </div>
      </div>

      <div className="flex">
        <a href="/">
          <Button
            className="flex items-center gap-1 underline"
            variant={"link"}>
            <IoArrowBack /> Home
          </Button>
        </a>
        <ThemeSwitcher />
      </div>
    </div>
  );
};

export default BlogHeader;
