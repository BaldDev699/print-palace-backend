import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RectangleHorizontal } from "lucide-react";

interface RectangleButtonProps {
  onClick: () => void;
  isActive: boolean;
}

export const RectangleButton: React.FC<RectangleButtonProps> = ({ onClick, isActive }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          size="icon"
          onClick={onClick}
          aria-label="Add Rectangle"
        >
          <RectangleHorizontal className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Add Rectangle</p>
      </TooltipContent>
    </Tooltip>
  );
};
