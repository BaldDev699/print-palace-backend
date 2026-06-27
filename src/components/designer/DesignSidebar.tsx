import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  MousePointer2,
  Pencil,
  Square,
  Circle,
  Type,
  Image,
  Shapes,
  Lightbulb,
  Palette,
  Printer,
  Trash2,
  Save,
  Layout,
} from "lucide-react";
import { ActiveTool } from "./Toolbar";
import { Canvas as FabricCanvas } from "fabric";
import { TextFormatMenu } from "./TextFormatMenu";
import { PrintingOptions } from "./PrintingOptions";
import { CollageControls } from "./collage/CollageControls";

interface DesignSidebarProps {
  activeTool: ActiveTool;
  onToolClick: (tool: Extract<ActiveTool, "select" | "draw" | "rectangle" | "circle">) => void;
  onAddText: () => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onOpenShapeLibrary: () => void;
  onOpenSuggestedDesigns: () => void;
  onOpenTemplates: () => void;
  onSaveDesign: () => void;
  fabricCanvas?: FabricCanvas | null;
  onPrintingMethodSelect?: (method: string) => void;
  // Collage controls
  collageGutter?: number;
  onCollageGutterChange?: (value: number) => void;
  collageCornerRadius?: number;
  onCollageCornerRadiusChange?: (value: number) => void;
  collageBackgroundColor?: string;
  onCollageBackgroundColorChange?: (color: string) => void;
  onCollageBackgroundImageUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onReplaceSelectedFrame?: () => void;
  onSwapFrames?: () => void;
  canSwapFrames?: boolean;
  onOpenCollageTemplates?: () => void;
}

export const DesignSidebar: React.FC<DesignSidebarProps> = ({
  activeTool,
  onToolClick,
  onAddText,
  onImageUpload,
  onClear,
  onOpenShapeLibrary,
  onOpenSuggestedDesigns,
  onOpenTemplates,
  onSaveDesign,
  fabricCanvas,
  onPrintingMethodSelect,
  // Collage props
  collageGutter = 12,
  onCollageGutterChange,
  collageCornerRadius = 16,
  onCollageCornerRadiusChange,
  collageBackgroundColor = "#ffffff",
  onCollageBackgroundColorChange,
  onCollageBackgroundImageUpload,
  onReplaceSelectedFrame,
  onSwapFrames,
  canSwapFrames = false,
  onOpenCollageTemplates,
}) => {
  const toolButtons = [
    {
      id: "select" as const,
      icon: MousePointer2,
      label: "Select",
      tooltip: "Select and move objects",
    },
    { id: "draw" as const, icon: Pencil, label: "Draw", tooltip: "Free drawing tool" },
    { id: "rectangle" as const, icon: Square, label: "Rectangle", tooltip: "Add rectangle shape" },
    { id: "circle" as const, icon: Circle, label: "Circle", tooltip: "Add circle shape" },
  ];

  const insertButtons = [
    { action: onAddText, icon: Type, label: "Text", tooltip: "Add text element" },
    {
      action: () => document.getElementById("image-upload")?.click(),
      icon: Image,
      label: "Image",
      tooltip: "Upload image",
    },
    { action: onOpenShapeLibrary, icon: Shapes, label: "Shapes", tooltip: "Shape library" },
    {
      action: onOpenSuggestedDesigns,
      icon: Lightbulb,
      label: "Ideas",
      tooltip: "Design suggestions",
    },
  ];

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Design Tools</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Basic Tools */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Tools
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {toolButtons.map((tool) => (
                <Button
                  key={tool.id}
                  variant={activeTool === tool.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => onToolClick(tool.id)}
                  className="h-16 flex-col gap-1 text-xs"
                  title={tool.tooltip}
                >
                  <tool.icon className="h-4 w-4" />
                  {tool.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Insert Elements */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Insert
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {insertButtons.map((button, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={button.action}
                  className="h-16 flex-col gap-1 text-xs"
                  title={button.tooltip}
                >
                  <button.icon className="h-4 w-4" />
                  {button.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Templates */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Templates
            </h4>
            <Button
              variant="outline"
              onClick={onOpenTemplates}
              className="w-full justify-start gap-2"
            >
              <Palette className="h-4 w-4" />
              Browse Templates
            </Button>
          </div>

          <Separator />

          {/* Collage */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Collage
            </h4>
            {onOpenCollageTemplates &&
            onCollageGutterChange &&
            onCollageCornerRadiusChange &&
            onCollageBackgroundColorChange &&
            onCollageBackgroundImageUpload &&
            onReplaceSelectedFrame &&
            onSwapFrames ? (
              <CollageControls
                gutter={collageGutter}
                onGutterChange={onCollageGutterChange}
                cornerRadius={collageCornerRadius}
                onCornerRadiusChange={onCollageCornerRadiusChange}
                backgroundColor={collageBackgroundColor}
                onBackgroundColorChange={onCollageBackgroundColorChange}
                onBackgroundImageUpload={onCollageBackgroundImageUpload}
                onReplaceSelectedFrame={onReplaceSelectedFrame}
                onSwapFrames={onSwapFrames}
                canSwapFrames={canSwapFrames}
                onOpenCollageTemplates={onOpenCollageTemplates}
              />
            ) : (
              <Button
                variant="outline"
                onClick={onOpenCollageTemplates}
                className="w-full justify-start gap-2"
              >
                <Layout className="h-4 w-4" />
                Collage Templates
              </Button>
            )}
          </div>

          <Separator />

          {/* Text Formatting */}
          {fabricCanvas && (
            <>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Format
                </h4>
                <TextFormatMenu fabricCanvas={fabricCanvas} />
              </div>
              <Separator />
            </>
          )}

          {/* Printing Options */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Print
            </h4>
            <PrintingOptions onPrintingMethodSelect={onPrintingMethodSelect} />
          </div>

          <Separator />

          {/* Canvas Actions */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Actions
            </h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={onSaveDesign}
                className="w-full justify-start gap-2"
              >
                <Save className="h-4 w-4" />
                Save Design
              </Button>
              <Button
                variant="outline"
                onClick={onClear}
                className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Clear Canvas
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Hidden image upload input */}
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={onImageUpload}
        className="hidden"
      />
    </div>
  );
};
