import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Hand, 
  Download, 
  Undo, 
  Redo, 
  Settings 
} from 'lucide-react';

interface CanvasTopbarProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  isPanMode: boolean;
  onPanModeToggle: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onCanvasSizeChange: (width: number, height: number) => void;
  onExport: (format: string, quality: number, transparent: boolean) => void;
  currentCanvasSize: { width: number; height: number };
}

const presetSizes = [
  { name: 'Square (1:1)', width: 1080, height: 1080 },
  { name: 'Instagram Post', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'Facebook Post', width: 1200, height: 630 },
  { name: 'Twitter Post', width: 1200, height: 675 },
  { name: 'LinkedIn Post', width: 1200, height: 627 },
  { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { name: 'A4 Portrait', width: 2480, height: 3508 },
  { name: 'A4 Landscape', width: 3508, height: 2480 },
];

export const CanvasTopbar: React.FC<CanvasTopbarProps> = ({
  zoom,
  onZoomChange,
  isPanMode,
  onPanModeToggle,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onCanvasSizeChange,
  onExport,
  currentCanvasSize
}) => {
  const [isSizeDialogOpen, setIsSizeDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('png');
  const [exportQuality, setExportQuality] = useState(90);
  const [exportTransparent, setExportTransparent] = useState(false);
  const [customWidth, setCustomWidth] = useState(currentCanvasSize.width);
  const [customHeight, setCustomHeight] = useState(currentCanvasSize.height);

  const handleZoomIn = () => onZoomChange(Math.min(zoom * 1.2, 4));
  const handleZoomOut = () => onZoomChange(Math.max(zoom / 1.2, 0.1));
  const handleZoomReset = () => onZoomChange(1);

  const handlePresetSize = (width: number, height: number) => {
    onCanvasSizeChange(width, height);
    setCustomWidth(width);
    setCustomHeight(height);
    setIsSizeDialogOpen(false);
  };

  const handleCustomSize = () => {
    onCanvasSizeChange(customWidth, customHeight);
    setIsSizeDialogOpen(false);
  };

  const handleExport = () => {
    onExport(exportFormat, exportQuality, exportTransparent);
    setIsExportDialogOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border border-border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.1}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 4}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomReset}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Pan Mode Toggle */}
          <Button
            variant={isPanMode ? "default" : "outline"}
            size="sm"
            onClick={onPanModeToggle}
          >
            <Hand className="h-4 w-4" />
          </Button>

          {/* Canvas Size */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSizeDialogOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {currentCanvasSize.width} × {currentCanvasSize.height}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          {/* Export */}
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsExportDialogOpen(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Canvas Size Dialog */}
      <Dialog open={isSizeDialogOpen} onOpenChange={setIsSizeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Canvas Size</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {presetSizes.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  onClick={() => handlePresetSize(preset.width, preset.height)}
                  className="justify-start text-left"
                >
                  <div>
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {preset.width} × {preset.height}px
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Custom Size</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Width"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(parseInt(e.target.value) || 0)}
                />
                <Input
                  type="number"
                  placeholder="Height"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(parseInt(e.target.value) || 0)}
                />
              </div>
              <Button onClick={handleCustomSize} className="w-full">
                Apply Custom Size
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpg">JPG</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {exportFormat !== 'png' && (
              <div>
                <Label>Quality: {exportQuality}%</Label>
                <Slider
                  value={[exportQuality]}
                  onValueChange={([value]) => setExportQuality(value)}
                  min={10}
                  max={100}
                  step={10}
                  className="mt-2"
                />
              </div>
            )}

            <Button onClick={handleExport} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export {exportFormat.toUpperCase()}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};