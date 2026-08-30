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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CanvasTopbar } from "./CanvasTopbar";
import { ThreeDView } from "./ThreeDView";
import { Measurements } from "./Measurements";
import { toast } from "sonner";
import { Group, FabricObject, Textbox, Rect, Circle, Canvas as FabricCanvas } from "fabric";
import ThreeDCanvas from "./ThreeDCanvas";

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
      setIsPreviewSheetOpen: (open: boolean) => void;
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
  const [isPreviewSheetOpen, setIsPreviewSheetOpen] = useState<boolean>(false);

  const { fabricCanvas, initCanvas, setDesignSize, designSize, refreshDisplaySize } =
    useDesignCanvas();
  const { addShape, addEmblem } = useCanvasShapes(fabricCanvas);
  const { addText } = useCanvasText(fabricCanvas);
  const { handleImageUpload } = useCanvasImage(fabricCanvas);
  const collageFrames = useCollageFrames(fabricCanvas);
  const canvasHistory = useCanvasHistory(fabricCanvas);
  const [zoom, setZoom] = useState(1);

  const handleZoomChange = (newZoom: number) => {
    if (!fabricCanvas) return;
    setZoom(newZoom);
    fabricCanvas.setZoom(newZoom);
    fabricCanvas.renderAll();
  };
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
        setIsPreviewSheetOpen,
        applyTemplate,
        templates,
        currentMockup: externalCurrentMockup || currentMockup,
      };
    }
  }, [fabricCanvas, templates, currentMockup, externalCurrentMockup]);

  return (
    <div className="w-full h-full flex flex-col">
      <CanvasTopbar
        zoom={zoom}
        onZoomChange={handleZoomChange}
        isPanMode={false}
        onPanModeToggle={() => {}}
        canUndo={canvasHistory.canUndo}
        canRedo={canvasHistory.canRedo}
        onUndo={canvasHistory.undo}
        onRedo={canvasHistory.redo}
        onCanvasSizeChange={setDesignSize}
        onExport={() => {}}
        currentCanvasSize={designSize}
      />

      {/* Canvas Container - this stays flex-1 (large) because it's what
          updateDisplaySize() measures to decide how big to render the
          canvas - it must NOT shrink to match the canvas's own size, or
          that measurement becomes circular. The visible border/background
          is applied to the canvas element itself instead, so what the
          user actually SEES hugs the canvas's real rendered size rather
          than this full measurement region (which is often much taller
          than a square design on a narrow mobile screen). */}
      <div className="flex-1 min-h-[500px] w-full relative flex items-center justify-center p-4 mt-4 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="shadow-lg shrink-0 border-2 border-border rounded-lg bg-white"
      />
      </div>

      {/* Bottom Panel - stacked under the canvas on desktop/tablet only.
          On mobile these live behind the "Preview" button in the bottom
          toolbar (see DesignerPage) so the canvas keeps the full screen. */}
      {/* Bottom Panel - Desktop only */}
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="h-[450px]">
          <ThreeDCanvas
            canvasData={fabricCanvas?.toDataURL({
              format: "png",
              quality: 0.8,
              multiplier: 1,
            })}
            productType={activeMockupObject?.data?.productType}
          />
        </div>

        <Measurements
          onMeasurementsChange={onMeasurementsChange || (() => {})}
        />
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
          // The template picker sheet closes as part of applying a
          // template, and its closing animation changes how much visible
          // space the canvas container actually has (especially on
          // mobile, where it's a large bottom sheet). Re-measure once
          // that's settled instead of relying only on ResizeObserver,
          // which can occasionally miss animated size changes.
          setTimeout(refreshDisplaySize, 350);
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

      {/* Mobile-only: 3D View + Measurements, opened from the bottom toolbar
          "Preview" button instead of being permanently stacked under the
          canvas (which is what was pushing content off small screens). */}
      <Sheet open={isPreviewSheetOpen} onOpenChange={setIsPreviewSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] p-0 md:hidden">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Preview & Measurements</SheetTitle>
          </SheetHeader>

          <div className="h-full overflow-y-auto p-4 flex flex-col gap-4">
            <div className="h-[400px]">
              <ThreeDCanvas
                canvasData={fabricCanvas?.toDataURL({
                  format: "png",
                  quality: 0.8,
                  multiplier: 1,
                })}
                productType={activeMockupObject?.data?.productType}
              />
            </div>

            <Measurements
              onMeasurementsChange={onMeasurementsChange || (() => {})}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
