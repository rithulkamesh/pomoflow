import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import NotionAvatar from "../NotionAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useToast } from "../ui/use-toast";

const Header: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();

  return (
    <div className="flex justify-between items-center h-12 w-screen px-5 my-2">
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
      <DropdownMenu>
        <DropdownMenuTrigger>
          <NotionAvatar name={auth.currentUser!.displayName!} />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="ml-2 mt-1 p-0">
          <DropdownMenuLabel>
            <Button
              variant="link"
              onClick={() => {
                void signOut(auth)
                  .catch((e) => {
                    let message = "Couldn't log out";

                    if (e instanceof Error) {
                      message = e.message;
                    }

                    toast({
                      title: "Error",
                      description: message,
                      variant: "destructive",
                    });
                  })
                  .then(() => router.push("/"));
              }}>
              Log out
            </Button>
          </DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Header;
