import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Pencil } from "lucide-react";

interface DrawButtonProps {
  onClick: () => void;
  isActive: boolean;
}

export const DrawButton: React.FC<DrawButtonProps> = ({ onClick, isActive }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          size="icon"
          onClick={onClick}
          aria-label="Drawing Tool"
        >
          <Pencil className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Drawing Tool</p>
      </TooltipContent>
    </Tooltip>
  );
};
