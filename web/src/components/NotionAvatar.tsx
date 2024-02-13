import { notionists } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  className?: string;
}

const NotionAvatar: React.FC<Props> = ({ name, className }) => {
  const avatar = createAvatar(notionists, {
    seed: name,
  });
  return (
    <Avatar>
      <AvatarImage
        src={avatar.toDataUriSync()}
        className={cn("dark:bg-white", className)}
      />
      <AvatarFallback>{name}</AvatarFallback>
    </Avatar>
  );
};

export default NotionAvatar;
