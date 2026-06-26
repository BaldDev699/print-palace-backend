import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { ColorPicker } from '../ColorPicker';
import { Layout, Upload, Shuffle, RefreshCw } from 'lucide-react';

interface CollageControlsProps {
  gutter: number;
  onGutterChange: (value: number) => void;
  cornerRadius: number;
  onCornerRadiusChange: (value: number) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  onBackgroundImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onReplaceSelectedFrame: () => void;
  onSwapFrames: () => void;
  canSwapFrames: boolean;
  onOpenCollageTemplates: () => void;
}

export const CollageControls: React.FC<CollageControlsProps> = ({
  gutter,
  onGutterChange,
  cornerRadius,
  onCornerRadiusChange,
  backgroundColor,
  onBackgroundColorChange,
  onBackgroundImageUpload,
  onReplaceSelectedFrame,
  onSwapFrames,
  canSwapFrames,
  onOpenCollageTemplates
}) => {
  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onOpenCollageTemplates}
        className="w-full justify-start gap-2"
      >
        <Layout className="h-4 w-4" />
        Collage Templates
      </Button>

      <Card className="p-3">
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-medium">Gutter</Label>
            <div className="mt-1 px-2">
              <Slider
                value={[gutter]}
                onValueChange={([value]) => onGutterChange(value)}
                min={0}
                max={40}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0px</span>
                <span>{gutter}px</span>
                <span>40px</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium">Corner Radius</Label>
            <div className="mt-1 px-2">
              <Slider
                value={[cornerRadius]}
                onValueChange={([value]) => onCornerRadiusChange(value)}
                min={0}
                max={40}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0px</span>
                <span>{cornerRadius}px</span>
                <span>40px</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-3">
        <Label className="text-xs font-medium mb-2 block">Background</Label>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Color</Label>
            <ColorPicker
              color={backgroundColor}
              onChange={onBackgroundColorChange}
            />
          </div>
          
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={onBackgroundImageUpload}
              className="hidden"
              id="background-image-upload"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('background-image-upload')?.click()}
              className="w-full justify-start gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Background
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-3">
        <Label className="text-xs font-medium mb-2 block">Frame Actions</Label>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReplaceSelectedFrame}
            className="w-full justify-start gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Replace Image
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onSwapFrames}
            disabled={!canSwapFrames}
            className="w-full justify-start gap-2"
          >
            <Shuffle className="h-4 w-4" />
            Swap Images
          </Button>
        </div>
      </Card>
    </div>
  );
};