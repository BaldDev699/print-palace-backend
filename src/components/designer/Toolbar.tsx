
import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SelectButton } from './toolbar/buttons/SelectButton';
import { DrawButton } from './toolbar/buttons/DrawButton';
import { RectangleButton } from './toolbar/buttons/RectangleButton';
import { CircleButton } from './toolbar/buttons/CircleButton';
import { TextButton } from './toolbar/buttons/TextButton';
import { ImageUploadButton } from './toolbar/buttons/ImageUploadButton';
import { ClearButton } from './toolbar/buttons/ClearButton';
import { ShapeLibraryButton } from './toolbar/buttons/ShapeLibraryButton';
import { SuggestedDesignsButton } from './toolbar/buttons/SuggestedDesignsButton';
import { TemplateButton } from './toolbar/buttons/TemplateButton';
import { TextFormatMenu } from './TextFormatMenu';
import { PrintingOptions } from './PrintingOptions';
import { Canvas as FabricCanvas } from 'fabric';

export type ActiveTool = 
  | 'select' 
  | 'draw' 
  | 'rectangle' 
  | 'circle' 
  | 'text' 
  | 'shape-library'
  | 'suggested-designs';

interface ToolbarProps {
  activeTool: ActiveTool;
  onToolClick: (tool: Extract<ActiveTool, 'select' | 'draw' | 'rectangle' | 'circle'>) => void;
  onAddText: () => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onOpenShapeLibrary: () => void;
  onOpenSuggestedDesigns: () => void;
  onOpenTemplates: () => void;
  fabricCanvas?: FabricCanvas | null;
  onPrintingMethodSelect?: (method: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  activeTool, 
  onToolClick, 
  onAddText,
  onImageUpload,
  onClear,
  onOpenShapeLibrary,
  onOpenSuggestedDesigns,
  onOpenTemplates,
  fabricCanvas,
  onPrintingMethodSelect
}) => {
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2 p-2 border border-border rounded-lg bg-card shadow">
        {/* Primary Tools Row */}
        <div className="flex items-center gap-1 flex-wrap">
          <SelectButton onClick={() => onToolClick('select')} isActive={activeTool === 'select'} />
          <DrawButton onClick={() => onToolClick('draw')} isActive={activeTool === 'draw'} />
          <RectangleButton onClick={() => onToolClick('rectangle')} isActive={activeTool === 'rectangle'} />
          <CircleButton onClick={() => onToolClick('circle')} isActive={activeTool === 'circle'} />
          <TextButton onClick={onAddText} isActive={activeTool === 'text'} />
          <ImageUploadButton onImageUpload={onImageUpload} />
        </div>
        
        {/* Secondary Tools Row */}
        <div className="flex items-center gap-1 flex-wrap">
          <ShapeLibraryButton onClick={onOpenShapeLibrary} isActive={activeTool === 'shape-library'} />
          <SuggestedDesignsButton onClick={onOpenSuggestedDesigns} isActive={activeTool === 'suggested-designs'} />
          <TemplateButton onClick={onOpenTemplates} />
          <TextFormatMenu fabricCanvas={fabricCanvas} />
          <PrintingOptions onPrintingMethodSelect={onPrintingMethodSelect} />
        </div>
        
        {/* Actions Row */}
        <div className="flex items-center gap-1 pt-2 border-t border-border">
          <ClearButton onClick={onClear} />
        </div>
      </div>
    </TooltipProvider>
  );
};
