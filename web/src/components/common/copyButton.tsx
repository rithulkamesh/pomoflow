import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { IoCheckmark, IoLinkOutline } from "react-icons/io5";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";

interface CopyButtonProps {
  link: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ link }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    setCopied(true);

    void navigator.clipboard.writeText(
      "https://pomoflow.rithul.dev/session/" + link
    );
    toast({
      title: "Link Copied!",
      description: "The session link has been copied to your clipboard.",
    });
  };

  useEffect(() => {
    if (copied) setTimeout(() => setCopied(false), 1000);
  }, [copied]);

  return (
    <Button variant="ghost" size="icon" onClick={copyLink}>
      <IoLinkOutline
        className={cn(
          "rotate-[-35deg] block animate-in fade-in-0",
          copied && "hidden"
        )}
      />

      <IoCheckmark
        className={cn(
          "transition-all hidden",
          copied && "block animate-in fade-in-0 zoom-in-0"
        )}
      />
    </Button>
  );
};
