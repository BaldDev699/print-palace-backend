import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GalleryHorizontal } from "lucide-react"; // New icon

interface SuggestedDesignsButtonProps {
  onClick: () => void;
  isActive: boolean;
}

export const SuggestedDesignsButton: React.FC<SuggestedDesignsButtonProps> = ({
  onClick,
  isActive,
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          size="icon"
          onClick={onClick}
          aria-label="Open Suggested Designs"
        >
          <GalleryHorizontal className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Suggested Designs</p>
      </TooltipContent>
    </Tooltip>
  );
};
