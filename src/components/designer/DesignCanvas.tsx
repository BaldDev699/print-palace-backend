import React, { useEffect, useRef, useState } from "react";
import { useDesignCanvas } from "@/hooks/useDesignCanvas";
import { useCanvasDrawing } from "@/hooks/useCanvasDrawing";
import { useCanvasShapes } from "@/hooks/useCanvasShapes";
import { useCanvasText } from "@/hooks/useCanvasText";
import { useCanvasImage } from "@/hooks/useCanvasImage";
import { useTemplates } from "@/hooks/useTemplates";
import { useCollageFrames } from "@/hooks/useCollageFrames";
import { useCanvasHistory } from "@/hooks/useCanvasHistory";
import { useCanvasFilters } from "@/hooks/useCanvasFilters";
import { useCanvasGuides } from "@/hooks/useCanvasGuides";
import { Templates } from "./Templates";
import { ShapeLibrary } from "./ShapeLibrary";
import { SuggestedDesigns, SuggestedDesign } from "./SuggestedDesigns";
import { CollageTemplates, CollageLayout } from "./collage/CollageTemplates";
import { CanvasTopbar } from "./CanvasTopbar";
import { ThreeDView } from "./ThreeDView";
import { Measurements } from "./Measurements";
import { toast } from "sonner";
import { Group, FabricObject, Textbox, Rect, Circle, Canvas as FabricCanvas } from "fabric";

export { type ActiveTool } from "./Toolbar";

// Extend FabricObject to include custom properties
interface CustomFabricObject extends FabricObject {
  data?: {
    isMockup?: boolean;
    productType?: string;
  };
  id?: string;
  name?: string;
}

interface CustomGroup extends Group {
  data?: {
    isMockup?: boolean;
    productType?: string;
  };
  id?: string;
  name?: string;
}

interface DesignCanvasProps {
  onCanvasReady?: (canvas: FabricCanvas | null) => void;
  onMeasurementsChange?: (measurements: Record<string, number>) => void;
  onProductTypeChange?: (productType: string) => void;
  activeTool?: string;
  onToolChange?: (tool: string) => void;
  drawingColor?: string;
  mockupColor?: string;
  onMockupColorChange?: (color: string) => void;
  currentMockup?: any;
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
  // Canvas controls
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  isPanMode?: boolean;
  onPanModeToggle?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onCanvasSizeChange?: (width: number, height: number) => void;
  onExport?: (format: string, quality: number, transparent: boolean) => void;
  currentCanvasSize?: { width: number; height: number };
}

// Declare global window interface for design canvas API
declare global {
  interface Window {
    designCanvasAPI?: {
      handleToolClick: (tool: string) => void;
      handleAddText: () => void;
      handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
      handleEmblemSelect: (emblem: any) => void;
      handleSuggestedDesignSelect: (design: SuggestedDesign, mode: "add" | "replace") => void;
      setIsShapeLibraryOpen: (open: boolean) => void;
      setIsSuggestedDesignsOpen: (open: boolean) => void;
      setIsTemplateDrawerOpen: (open: boolean) => void;
      applyTemplate: (template: any) => void;
      templates: any[];
      currentMockup: any;
    };
  }
}

export const DesignCanvas: React.FC<DesignCanvasProps> = ({
  onCanvasReady,
  onMeasurementsChange,
  onProductTypeChange,
  activeTool = "select",
  onToolChange,
  drawingColor: externalDrawingColor,
  mockupColor: externalMockupColor,
  onMockupColorChange,
  currentMockup: externalCurrentMockup,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use external state when provided, otherwise use internal state
  const [internalDrawingColor, setInternalDrawingColor] = useState("#000000");
  const [internalMockupColor, setInternalMockupColor] = useState("#cccccc");
  const drawingColor = externalDrawingColor || internalDrawingColor;
  const mockupColor = externalMockupColor || internalMockupColor;
  const setMockupColor = onMockupColorChange || setInternalMockupColor;

  const [activeMockupObject, setActiveMockupObject] = useState<
    CustomFabricObject | CustomGroup | null
  >(null);
  const [isShapeLibraryOpen, setIsShapeLibraryOpen] = useState<boolean>(false);
  const [isSuggestedDesignsOpen, setIsSuggestedDesignsOpen] = useState<boolean>(false);
  const [isCollageTemplatesOpen, setIsCollageTemplatesOpen] = useState<boolean>(false);

  const { fabricCanvas, initCanvas } = useDesignCanvas();
  const { addShape, addEmblem } = useCanvasShapes(fabricCanvas);
  const { addText } = useCanvasText(fabricCanvas);
  const { handleImageUpload } = useCanvasImage(fabricCanvas);
  const collageFrames = useCollageFrames(fabricCanvas);
  const canvasHistory = useCanvasHistory(fabricCanvas);
  const canvasFilters = useCanvasFilters(fabricCanvas);
  const canvasGuides = useCanvasGuides(fabricCanvas);

  // Pass setActiveMockupObject and mockupColor to useTemplates
  const {
    templates,
    isTemplateDrawerOpen,
    setIsTemplateDrawerOpen,
    applyTemplate,
    currentMockup,
    changeMockupColor,
  } = useTemplates(fabricCanvas, setActiveMockupObject, mockupColor);

  useEffect(() => {
    const cleanup = initCanvas(canvasRef as any);
    setIsTemplateDrawerOpen(true);
    return () => {
      if (typeof cleanup === "function") {
        cleanup();
      }
    };
  }, [initCanvas]);

  useEffect(() => {
    if (onCanvasReady) {
      onCanvasReady(fabricCanvas);
    }
  }, [fabricCanvas, onCanvasReady]);

  useCanvasDrawing(fabricCanvas, activeTool === "draw", drawingColor);

  useEffect(() => {
    if (currentMockup && changeMockupColor) {
      changeMockupColor(mockupColor, false);
    }
  }, [mockupColor, currentMockup, changeMockupColor]);
  const handleToolClick = (tool: string) => {
    onToolChange?.(tool);
    if (fabricCanvas && (tool === "rectangle" || tool === "circle")) {
      addShape(tool as any, drawingColor);
    }
  };

  const handleAddText = () => {
    if (fabricCanvas) {
      addText(drawingColor);
    }
  };

  const handleEmblemSelect = (emblem: any) => {
    if (fabricCanvas) {
      addEmblem(emblem, drawingColor);
      toast.success(`${emblem.name} added to canvas!`);
    }
  };

  const handleSuggestedDesignSelect = (design: SuggestedDesign, mode: "add" | "replace") => {
    if (!fabricCanvas) return;

    if (mode === "replace") {
      const activeTemplate = templates.find(
        (t) =>
          currentMockup && (currentMockup as CustomFabricObject).name === `${t.productType}_mockup`,
      );
      if (activeTemplate && currentMockup) {
        fabricCanvas.getObjects().forEach((obj) => {
          if (obj !== currentMockup) {
            fabricCanvas.remove(obj);
          }
        });
      }
    }

    design.elements.forEach((element) => {
      let fabricObject: FabricObject | null = null;

      if (element.type === "text") {
        fabricObject = new Textbox(element.content, {
          left: element.position.x,
          top: element.position.y,
          ...element.style,
        });
      } else if (element.type === "shape") {
        if (element.content === "rectangle") {
          fabricObject = new Rect({
            left: element.position.x,
            top: element.position.y,
            ...element.style,
          });
        } else if (element.content === "circle") {
          fabricObject = new Circle({
            left: element.position.x,
            top: element.position.y,
            ...element.style,
          });
        }
      }

      if (fabricObject) {
        fabricCanvas.add(fabricObject);
      }
    });

    fabricCanvas.renderAll();
    toast.success(`${design.name} ${mode === "add" ? "added to" : "applied to"} canvas!`);
  };

  // Expose functions to parent for sidebar integration
  useEffect(() => {
    if (fabricCanvas) {
      (window as any).designCanvasAPI = {
        handleToolClick,
        handleAddText,
        handleImageUpload,
        handleEmblemSelect,
        handleSuggestedDesignSelect,
        setIsShapeLibraryOpen,
        setIsSuggestedDesignsOpen,
        setIsTemplateDrawerOpen,
        setIsCollageTemplatesOpen,
        applyTemplate,
        templates,
        currentMockup: externalCurrentMockup || currentMockup,
      };
    }
  }, [fabricCanvas, templates, currentMockup, externalCurrentMockup]);

  return (
    <div className="w-full h-full flex flex-col">
      <CanvasTopbar
        zoom={1}
        onZoomChange={() => {}}
        isPanMode={false}
        onPanModeToggle={() => {}}
        canUndo={canvasHistory.canUndo}
        canRedo={canvasHistory.canRedo}
        onUndo={canvasHistory.undo}
        onRedo={canvasHistory.redo}
        onCanvasSizeChange={() => {}}
        onExport={() => {}}
        currentCanvasSize={{ width: 1080, height: 1080 }}
      />

      {/* Canvas Container */}
      <div className="flex-1 border-2 border-border rounded-lg bg-muted/10 relative flex items-center justify-center p-4">
        <canvas ref={canvasRef} className="max-w-full max-h-full shadow-lg" />
      </div>

      {/* Bottom Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <ThreeDView
          canvasData={fabricCanvas?.toDataURL({ format: "png", quality: 0.8, multiplier: 1 })}
          productType={activeMockupObject?.data?.productType}
        />
        <Measurements onMeasurementsChange={onMeasurementsChange || (() => {})} />
      </div>

      {/* Modals */}
      <Templates
        open={isTemplateDrawerOpen}
        onOpenChange={setIsTemplateDrawerOpen}
        templates={templates}
        onTemplateSelect={(template) => {
          applyTemplate(template);
          if (onProductTypeChange) {
            onProductTypeChange(template.productType);
          }
        }}
      />

      <ShapeLibrary
        open={isShapeLibraryOpen}
        onOpenChange={setIsShapeLibraryOpen}
        onEmblemSelect={handleEmblemSelect}
      />

      <SuggestedDesigns
        open={isSuggestedDesignsOpen}
        onOpenChange={setIsSuggestedDesignsOpen}
        onDesignSelect={handleSuggestedDesignSelect}
      />

      <CollageTemplates
        open={isCollageTemplatesOpen}
        onOpenChange={setIsCollageTemplatesOpen}
        onLayoutSelect={(layout, mode) => {
          collageFrames.createCollage(layout, mode);
          setIsCollageTemplatesOpen(false);
        }}
      />
    </div>
  );
};
