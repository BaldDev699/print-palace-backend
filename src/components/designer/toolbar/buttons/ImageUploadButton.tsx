import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UploadCloud } from "lucide-react";

interface ImageUploadButtonProps {
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({ onImageUpload }) => {
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUploadClick = () => {
    imageInputRef.current?.click();
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleImageUploadClick}
            aria-label="Upload Image"
          >
            <UploadCloud className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Upload Image</p>
        </TooltipContent>
      </Tooltip>
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        style={{ display: "none" }}
        onChange={onImageUpload}
      />
    </>
  );
};
