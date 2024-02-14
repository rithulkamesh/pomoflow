import { IoDocument, IoLogoGithub } from "react-icons/io5";
import { WithTooltip } from "./common/withTooltip";
import { TooltipProvider } from "./ui/tooltip";

const Footer: React.FC = () => {
  return (
    <TooltipProvider>
      <footer className="mt-8 text-center text-gray-500">
        <p>
          Built with ❤️ by&nbsp;
          <a href="https://rithul.dev" className="underline" target="_blank">
            rithul kamesh
          </a>
          &nbsp;&&nbsp;
          <a href="https://qoobes.dev" className="underline" target="_blank">
            qoobes
          </a>
          .
        </p>
        <div className="flex gap-2 items-center justify-center mt-3">
          <WithTooltip text={"GitHub"}>
            <a
              href="https://github.com/rithulkamesh/pomoflow"
              className="underline"
              target="_blank">
              <IoLogoGithub size={25} />
            </a>
          </WithTooltip>
          <WithTooltip text={"Blog"}>
            <a href="/blogs" className="underline">
              <IoDocument size={25} />
            </a>
          </WithTooltip>
        </div>
      </footer>
    </TooltipProvider>
  );
};

export default Footer;
