
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MousePointer2 } from 'lucide-react';

interface SelectButtonProps {
  onClick: () => void;
  isActive: boolean;
}

export const SelectButton: React.FC<SelectButtonProps> = ({ onClick, isActive }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          size="icon"
          onClick={onClick}
          aria-label="Select Tool"
        >
          <MousePointer2 className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Select Tool</p>
      </TooltipContent>
    </Tooltip>
  );
};
