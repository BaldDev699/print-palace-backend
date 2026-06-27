import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Type } from "lucide-react";

interface TextButtonProps {
  onClick: () => void;
  isActive: boolean;
}

export const TextButton: React.FC<TextButtonProps> = ({ onClick, isActive }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          size="icon"
          onClick={onClick}
          aria-label="Add Text"
        >
          <Type className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Add Text</p>
      </TooltipContent>
    </Tooltip>
  );
};
