import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LayoutGrid as LayoutGridIcon } from "lucide-react"; // Changed from Templates to LayoutGrid

interface TemplateButtonProps {
  onClick: () => void;
}

export const TemplateButton: React.FC<TemplateButtonProps> = ({ onClick }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={onClick} aria-label="Templates">
          <LayoutGridIcon className="h-5 w-5" /> {/* Changed from TemplatesIcon */}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Templates</p>
      </TooltipContent>
    </Tooltip>
  );
};
