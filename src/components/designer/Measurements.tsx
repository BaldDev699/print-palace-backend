import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ruler, ChevronDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Define measurement types and their ranges
type MeasurementType = {
  name: string;
  min: number;
  max: number;
  unit: string;
  step: number;
};

// Define preset sizes
type SizePreset = {
  name: string;
  values: {
    [key: string]: number;
  };
};

interface MeasurementsProps {
  onMeasurementsChange?: (measurements: Record<string, number>) => void;
}

export const Measurements: React.FC<MeasurementsProps> = ({ onMeasurementsChange }) => {
  // Define measurement types
  const measurementTypes: MeasurementType[] = [
    { name: "shoulderWidth", min: 30, max: 60, unit: "cm", step: 0.5 },
    { name: "chestHalfWidth", min: 40, max: 70, unit: "cm", step: 0.5 },
    { name: "waistHalfWidth", min: 30, max: 65, unit: "cm", step: 0.5 },
    { name: "bottomHalfWidth", min: 40, max: 70, unit: "cm", step: 0.5 },
    { name: "sleeveLength", min: 50, max: 80, unit: "cm", step: 0.5 },
    { name: "sleeveOpeningWidth", min: 10, max: 25, unit: "cm", step: 0.5 },
  ];

  // Define preset sizes
  const sizePresets: SizePreset[] = [
    {
      name: "Small",
      values: {
        shoulderWidth: 40,
        chestHalfWidth: 48,
        waistHalfWidth: 42,
        bottomHalfWidth: 48,
        sleeveLength: 58,
        sleeveOpeningWidth: 14,
      },
    },
    {
      name: "Medium",
      values: {
        shoulderWidth: 45,
        chestHalfWidth: 54,
        waistHalfWidth: 48,
        bottomHalfWidth: 54,
        sleeveLength: 63,
        sleeveOpeningWidth: 16,
      },
    },
    {
      name: "Large",
      values: {
        shoulderWidth: 50,
        chestHalfWidth: 60,
        waistHalfWidth: 54,
        bottomHalfWidth: 60,
        sleeveLength: 68,
        sleeveOpeningWidth: 18,
      },
    },
  ];

  // Initialize measurements state with medium values
  const [measurements, setMeasurements] = useState<Record<string, number>>(sizePresets[1].values);

  // Handle measurement change
  const handleMeasurementChange = (name: string, value: number[]) => {
    const newMeasurements = {
      ...measurements,
      [name]: value[0],
    };
    setMeasurements(newMeasurements);

    if (onMeasurementsChange) {
      onMeasurementsChange(newMeasurements);
    }
  };

  // Apply preset size
  const handleSizePresetChange = (size: string) => {
    const preset = sizePresets.find((p) => p.name === size);
    if (preset) {
      setMeasurements(preset.values);

      if (onMeasurementsChange) {
        onMeasurementsChange(preset.values);
      }
    }
  };

  // Format display name from camelCase
  const formatDisplayName = (name: string): string => {
    return name.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Ruler className="h-4 w-4" />
          Measurements
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Garment Measurements</DialogTitle>
        </DialogHeader>

        <div className="mt-4 mb-6">
          <Label htmlFor="size-preset">Size Preset</Label>
          <Select onValueChange={handleSizePresetChange} defaultValue="Medium">
            <SelectTrigger id="size-preset" className="w-full mt-1">
              <SelectValue placeholder="Choose a size" />
            </SelectTrigger>
            <SelectContent>
              {sizePresets.map((preset) => (
                <SelectItem key={preset.name} value={preset.name}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-6">
          {measurementTypes.map((measurement) => (
            <div key={measurement.name} className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor={measurement.name}>{formatDisplayName(measurement.name)}</Label>
                <span className="text-sm text-muted-foreground">
                  {measurements[measurement.name]} {measurement.unit}
                </span>
              </div>
              <Slider
                id={measurement.name}
                min={measurement.min}
                max={measurement.max}
                step={measurement.step}
                value={[measurements[measurement.name]]}
                onValueChange={(value) => handleMeasurementChange(measurement.name, value)}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Adjust the measurements above for a custom fit or select a preset size.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
