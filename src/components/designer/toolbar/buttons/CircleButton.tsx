import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Circle } from "lucide-react";

interface CircleButtonProps {
  onClick: () => void;
  isActive: boolean;
}

export const CircleButton: React.FC<CircleButtonProps> = ({ onClick, isActive }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          size="icon"
          onClick={onClick}
          aria-label="Add Circle"
        >
          <Circle className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Add Circle</p>
      </TooltipContent>
    </Tooltip>
  );
};
