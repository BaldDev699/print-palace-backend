import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Shapes } from "lucide-react"; // New icon

interface ShapeLibraryButtonProps {
  onClick: () => void;
  isActive: boolean;
}

export const ShapeLibraryButton: React.FC<ShapeLibraryButtonProps> = ({ onClick, isActive }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          size="icon"
          onClick={onClick}
          aria-label="Open Shape Library"
        >
          <Shapes className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Shape Library</p>
      </TooltipContent>
    </Tooltip>
  );
};
