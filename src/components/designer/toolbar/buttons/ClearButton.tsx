import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2 } from "lucide-react";

interface ClearButtonProps {
  onClick: () => void;
}

export const ClearButton: React.FC<ClearButtonProps> = ({ onClick }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={onClick} aria-label="Clear Canvas">
          <Trash2 className="h-5 w-5 text-destructive" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Clear Canvas</p>
      </TooltipContent>
    </Tooltip>
  );
};
