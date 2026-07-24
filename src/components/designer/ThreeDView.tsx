import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { View } from "lucide-react";
import ThreeDCanvas from "./ThreeDCanvas";

interface ThreeDViewProps {
  canvasData?: string;
  productType?: "t-shirt" | "hoodie" | "cap" | "general" | string;
}

export const ThreeDView: React.FC<ThreeDViewProps> = ({
  canvasData,
  productType,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <View className="h-4 w-4" />
          3D Preview
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[800px] h-[600px]">
        <DialogHeader>
          <DialogTitle>
            3D Preview -{" "}
            {productType
              ? productType.charAt(0).toUpperCase() + productType.slice(1)
              : "Item"}
          </DialogTitle>

          <DialogDescription>
            Interactive 3D preview of your design. Click and drag to rotate,
            scroll to zoom.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <ThreeDCanvas
            canvasData={canvasData}
            productType={productType}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};