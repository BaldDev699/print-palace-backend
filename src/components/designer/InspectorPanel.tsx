import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ColorPicker } from "./ColorPicker";
import { useCanvasFilters } from "@/hooks/useCanvasFilters";
import { Canvas as FabricCanvas, FabricObject, Image as FabricImage } from "fabric";
import { Settings, Layers, Type, Palette, RotateCcw } from "lucide-react";

interface InspectorPanelProps {
  fabricCanvas?: FabricCanvas | null;
  currentMockup?: any;
  mockupColor: string;
  onMockupColorChange: (color: string) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  fabricCanvas,
  currentMockup,
  mockupColor,
  onMockupColorChange,
}) => {
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const [objectProperties, setObjectProperties] = useState<any>({});
  const { setBrightness, setContrast, setSaturation, setHue, setBlur, resetFilters, getImageFilters } =
    useCanvasFilters(fabricCanvas ?? null);
  // UI sliders work in -100..100 (0..100 for blur) for a nicer step size;
  // the underlying Fabric filters expect -1..1 (0..1 for blur), converted
  // at the call sites below.
  const DEFAULT_IMAGE_ADJUSTMENTS = { brightness: 0, contrast: 0, saturation: 0, hue: 0, blur: 0 };
  const [imageAdjustments, setImageAdjustments] = useState(DEFAULT_IMAGE_ADJUSTMENTS);

  useEffect(() => {
    if (!fabricCanvas) return;

    const handleSelection = () => {
      const activeObject = fabricCanvas.getActiveObject();
      setSelectedObject(activeObject || null);

      if (activeObject) {
        setObjectProperties({
          left: Math.round(activeObject.left || 0),
          top: Math.round(activeObject.top || 0),
          width: Math.round(activeObject.width || 0),
          height: Math.round(activeObject.height || 0),
          scaleX: activeObject.scaleX || 1,
          scaleY: activeObject.scaleY || 1,
          opacity: (activeObject.opacity || 1) * 100,
          fill: activeObject.fill || "#000000",
          stroke: activeObject.stroke || "",
          strokeWidth: activeObject.strokeWidth || 0,
        });

        if (activeObject.type === "image") {
          const current = getImageFilters(activeObject as FabricImage);
          setImageAdjustments({
            brightness: Math.round(current.brightness * 100),
            contrast: Math.round(current.contrast * 100),
            saturation: Math.round(current.saturation * 100),
            hue: Math.round(current.hue),
            blur: Math.round(current.blur * 100),
          });
        } else {
          setImageAdjustments(DEFAULT_IMAGE_ADJUSTMENTS);
        }
      }
    };

    const handleObjectModified = () => {
      handleSelection();
    };

    fabricCanvas.on("selection:created", handleSelection);
    fabricCanvas.on("selection:updated", handleSelection);
    fabricCanvas.on("selection:cleared", () => setSelectedObject(null));
    fabricCanvas.on("object:modified", handleObjectModified);

    return () => {
      fabricCanvas.off("selection:created", handleSelection);
      fabricCanvas.off("selection:updated", handleSelection);
      fabricCanvas.off("selection:cleared", () => setSelectedObject(null));
      fabricCanvas.off("object:modified", handleObjectModified);
    };
  }, [fabricCanvas]);

  const updateObjectProperty = (property: string, value: any) => {
    if (!selectedObject || !fabricCanvas) return;

    const updates: any = {};

    if (property === "opacity") {
      updates.opacity = value / 100;
    } else if (property === "left" || property === "top") {
      updates[property] = parseInt(value);
    } else {
      updates[property] = value;
    }

    selectedObject.set(updates);
    fabricCanvas.renderAll();

    setObjectProperties((prev: any) => ({ ...prev, [property]: value }));
  };

  const deleteSelectedObject = () => {
    if (!selectedObject || !fabricCanvas) return;
    fabricCanvas.remove(selectedObject);
    fabricCanvas.renderAll();
  };

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Properties
        </h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Template Properties */}
          {currentMockup && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <h4 className="text-sm font-medium text-foreground">Template</h4>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Product Color</Label>
                  <div className="mt-2">
                    <ColorPicker color={mockupColor} onChange={onMockupColorChange} />
                  </div>
                </div>

                {/* Color Swatches */}
                {currentMockup?.data?.availableColors && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Quick Colors</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {currentMockup.data.availableColors.map((color: string, index: number) => (
                        <button
                          key={index}
                          className="w-8 h-8 rounded-full border-2 border-border hover:border-primary transition-colors"
                          style={{ backgroundColor: color }}
                          onClick={() => onMockupColorChange(color)}
                          title={`Color ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Separator />
            </div>
          )}

          {/* Object Properties */}
          {selectedObject ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <h4 className="text-sm font-medium text-foreground">Selected Object</h4>
              </div>

              <div className="space-y-4">
                {/* Position */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">X Position</Label>
                    <Input
                      type="number"
                      value={objectProperties.left || 0}
                      onChange={(e) => updateObjectProperty("left", e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Y Position</Label>
                    <Input
                      type="number"
                      value={objectProperties.top || 0}
                      onChange={(e) => updateObjectProperty("top", e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                {/* Size */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Width</Label>
                    <Input
                      type="number"
                      value={Math.round(
                        (objectProperties.width || 0) * (objectProperties.scaleX || 1),
                      )}
                      onChange={(e) => {
                        const newWidth = parseInt(e.target.value);
                        const scaleX = newWidth / (objectProperties.width || 1);
                        updateObjectProperty("scaleX", scaleX);
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Height</Label>
                    <Input
                      type="number"
                      value={Math.round(
                        (objectProperties.height || 0) * (objectProperties.scaleY || 1),
                      )}
                      onChange={(e) => {
                        const newHeight = parseInt(e.target.value);
                        const scaleY = newHeight / (objectProperties.height || 1);
                        updateObjectProperty("scaleY", scaleY);
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                {/* Opacity */}
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Opacity ({objectProperties.opacity}%)
                  </Label>
                  <Slider
                    value={[objectProperties.opacity || 100]}
                    onValueChange={([value]) => updateObjectProperty("opacity", value)}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>

                {/* Colors */}
                {selectedObject.type !== "image" && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Fill Color</Label>
                      <div className="mt-2">
                        <ColorPicker
                          color={objectProperties.fill || "#000000"}
                          onChange={(color) => updateObjectProperty("fill", color)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Stroke Color</Label>
                      <div className="mt-2">
                        <ColorPicker
                          color={objectProperties.stroke || "#000000"}
                          onChange={(color) => updateObjectProperty("stroke", color)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Stroke Width</Label>
                      <Input
                        type="number"
                        value={objectProperties.strokeWidth || 0}
                        onChange={(e) =>
                          updateObjectProperty("strokeWidth", parseInt(e.target.value))
                        }
                        className="h-8 text-xs mt-1"
                        min={0}
                      />
                    </div>
                  </div>
                )}

                {/* Text Properties */}
                {selectedObject.type === "textbox" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      <span className="text-xs font-medium">Text Properties</span>
                    </div>
                    {/* Text formatting controls would go here */}
                  </div>
                )}

                {/* Image Adjustments */}
                {selectedObject.type === "image" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        <span className="text-xs font-medium">Image Adjustments</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          resetFilters(selectedObject as FabricImage);
                          setImageAdjustments(DEFAULT_IMAGE_ADJUSTMENTS);
                        }}
                        className="h-6 px-2"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Brightness</Label>
                        <Slider
                          value={[imageAdjustments.brightness]}
                          onValueChange={([value]) => {
                            setImageAdjustments((prev) => ({ ...prev, brightness: value }));
                            setBrightness(selectedObject as FabricImage, value / 100);
                          }}
                          min={-100}
                          max={100}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Contrast</Label>
                        <Slider
                          value={[imageAdjustments.contrast]}
                          onValueChange={([value]) => {
                            setImageAdjustments((prev) => ({ ...prev, contrast: value }));
                            setContrast(selectedObject as FabricImage, value / 100);
                          }}
                          min={-100}
                          max={100}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Saturation</Label>
                        <Slider
                          value={[imageAdjustments.saturation]}
                          onValueChange={([value]) => {
                            setImageAdjustments((prev) => ({ ...prev, saturation: value }));
                            setSaturation(selectedObject as FabricImage, value / 100);
                          }}
                          min={-100}
                          max={100}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Hue</Label>
                        <Slider
                          value={[imageAdjustments.hue]}
                          onValueChange={([value]) => {
                            setImageAdjustments((prev) => ({ ...prev, hue: value }));
                            setHue(selectedObject as FabricImage, value);
                          }}
                          min={0}
                          max={360}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Blur</Label>
                        <Slider
                          value={[imageAdjustments.blur]}
                          onValueChange={([value]) => {
                            setImageAdjustments((prev) => ({ ...prev, blur: value }));
                            setBlur(selectedObject as FabricImage, value / 100);
                          }}
                          min={0}
                          max={100}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Delete Button */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={deleteSelectedObject}
                  className="w-full"
                >
                  Delete Object
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Layers className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Select an object to edit its properties
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
