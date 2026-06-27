import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="color-picker" className="text-sm">
        Color
      </Label>
      <Input
        type="color"
        id="color-picker"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="w-16 h-10 p-1"
      />
    </div>
  );
};
