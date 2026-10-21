import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useCanvasFilters } from "@/hooks/useCanvasFilters";
import { Canvas as FabricCanvas, FabricObject, Image as FabricImage } from "fabric";
import {
  SlidersHorizontal,
  Layers,
  Palette,
  RotateCcw,
  Copy,
  ArrowUp,
  ArrowDown,
  Trash2,
  MousePointerClick,
  Move,
  Droplet,
  ImageIcon,
} from "lucide-react";

interface InspectorPanelProps {
  fabricCanvas?: FabricCanvas | null;
  currentMockup?: any;
  mockupColor: string;
  onMockupColorChange: (color: string) => void;
}

/* ---------- small building blocks ---------- */

const Section: React.FC<{
  icon: React.ElementType;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ icon: Icon, title, action, children }) => (
  <section className="rounded-xl border border-border bg-background/40 p-3.5 space-y-3">
    <div className="flex items-center justify-between">
      <h4 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </h4>
      {action}
    </div>
    {children}
  </section>
);

const NumberField: React.FC<{
  label: string;
  value: number;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
  <label className="relative block">
    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-muted-foreground">
      {label}
    </span>
    <Input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 pl-7 text-xs rounded-lg"
    />
  </label>
);

const SliderRow: React.FC<{
  label: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  onChange: (v: number) => void;
}> = ({ label, value, min = 0, max = 100, unit = "", onChange }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums font-medium text-foreground">
        {Math.round(value)}
        {unit}
      </span>
    </div>
    <Slider value={[value]} min={min} max={max} step={1} onValueChange={([v]) => onChange(v)} />
  </div>
);

const toHex = (v: unknown, fallback = "#000000") =>
  typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v) ? v : fallback;

const ColorField: React.FC<{
  label: string;
  value: unknown;
  onChange: (hex: string) => void;
}> = ({ label, value, onChange }) => {
  const hex = toHex(value);
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1 cursor-pointer hover:border-foreground/40 transition-colors">
        <span className="h-5 w-5 rounded-md border border-border" style={{ backgroundColor: hex }} />
        <span className="text-xs font-mono uppercase">{hex}</span>
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
      </label>
    </div>
  );
};

/* ---------- main panel ---------- */

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

  // UI sliders work in -100..100 (0..100 for blur); Fabric filters expect -1..1 (0..1 for blur).
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
          opacity: (activeObject.opacity ?? 1) * 100,
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

    const handleCleared = () => setSelectedObject(null);

    fabricCanvas.on("selection:created", handleSelection);
    fabricCanvas.on("selection:updated", handleSelection);
    fabricCanvas.on("selection:cleared", handleCleared);
    fabricCanvas.on("object:modified", handleSelection);

    return () => {
      fabricCanvas.off("selection:created", handleSelection);
      fabricCanvas.off("selection:updated", handleSelection);
      fabricCanvas.off("selection:cleared", handleCleared);
      fabricCanvas.off("object:modified", handleSelection);
    };
  }, [fabricCanvas]);

  const updateObjectProperty = (property: string, value: any) => {
    if (!selectedObject || !fabricCanvas) return;

    const updates: any = {};
    if (property === "opacity") updates.opacity = value / 100;
    else if (property === "left" || property === "top") updates[property] = parseInt(value) || 0;
    else updates[property] = value;

    selectedObject.set(updates);
    selectedObject.setCoords();
    fabricCanvas.renderAll();
    setObjectProperties((prev: any) => ({ ...prev, [property]: value }));
  };

  const deleteSelectedObject = () => {
    if (!selectedObject || !fabricCanvas) return;
    fabricCanvas.remove(selectedObject);
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
    setSelectedObject(null);
  };

  const duplicateSelectedObject = async () => {
    if (!selectedObject || !fabricCanvas) return;
    const cloned = await selectedObject.clone();
    cloned.set({ left: (cloned.left || 0) + 24, top: (cloned.top || 0) + 24 });
    fabricCanvas.add(cloned);
    fabricCanvas.setActiveObject(cloned);
    fabricCanvas.renderAll();
  };

  const bringForward = () => {
    if (!selectedObject || !fabricCanvas) return;
    fabricCanvas.bringObjectForward(selectedObject);
    fabricCanvas.renderAll();
  };

  const sendBackward = () => {
    if (!selectedObject || !fabricCanvas) return;
    fabricCanvas.sendObjectBackwards(selectedObject);
    fabricCanvas.renderAll();
  };

  const isImage = selectedObject?.type === "image";

  const adjust = (
    key: keyof typeof DEFAULT_IMAGE_ADJUSTMENTS,
    value: number,
    apply: (img: FabricImage, v: number) => void,
    divisor: number,
  ) => {
    setImageAdjustments((prev) => ({ ...prev, [key]: value }));
    apply(selectedObject as FabricImage, value / divisor);
  };

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-border flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-foreground">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Properties
        </h3>
        {selectedObject && (
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            {selectedObject.type}
          </span>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Product color */}
          {currentMockup && (
            <Section icon={Palette} title="Product color">
              {currentMockup?.data?.availableColors && (
                <div className="flex flex-wrap gap-2">
                  {currentMockup.data.availableColors.map((color: string, index: number) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => onMockupColorChange(color)}
                      title={color}
                      className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                        mockupColor === color ? "border-primary ring-2 ring-primary/40" : "border-border"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
              <ColorField label="Custom" value={mockupColor} onChange={onMockupColorChange} />
            </Section>
          )}

          {selectedObject ? (
            <>
              {/* Quick actions */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: Copy, label: "Duplicate", onClick: duplicateSelectedObject },
                  { icon: ArrowUp, label: "Forward", onClick: bringForward },
                  { icon: ArrowDown, label: "Back", onClick: sendBackward },
                  { icon: Trash2, label: "Delete", onClick: deleteSelectedObject, danger: true },
                ].map(({ icon: Icon, label, onClick, danger }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={onClick}
                    className={`flex flex-col items-center gap-1 rounded-xl border border-border bg-background/40 py-2.5 text-[10px] font-medium transition-colors ${
                      danger
                        ? "text-destructive hover:bg-destructive/10 hover:border-destructive/50"
                        : "text-muted-foreground hover:text-foreground hover:border-foreground/40"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Layout */}
              <Section icon={Move} title="Position & size">
                <div className="grid grid-cols-2 gap-2">
                  <NumberField label="X" value={objectProperties.left || 0} onChange={(v) => updateObjectProperty("left", v)} />
                  <NumberField label="Y" value={objectProperties.top || 0} onChange={(v) => updateObjectProperty("top", v)} />
                  <NumberField
                    label="W"
                    value={Math.round((objectProperties.width || 0) * (objectProperties.scaleX || 1))}
                    onChange={(v) => {
                      const w = parseInt(v);
                      if (!w) return;
                      updateObjectProperty("scaleX", w / (objectProperties.width || 1));
                    }}
                  />
                  <NumberField
                    label="H"
                    value={Math.round((objectProperties.height || 0) * (objectProperties.scaleY || 1))}
                    onChange={(v) => {
                      const h = parseInt(v);
                      if (!h) return;
                      updateObjectProperty("scaleY", h / (objectProperties.height || 1));
                    }}
                  />
                </div>
              </Section>

              {/* Appearance */}
              <Section icon={Droplet} title="Appearance">
                <SliderRow
                  label="Opacity"
                  unit="%"
                  value={objectProperties.opacity ?? 100}
                  onChange={(v) => updateObjectProperty("opacity", v)}
                />
                {!isImage && (
                  <>
                    <ColorField
                      label="Fill"
                      value={objectProperties.fill}
                      onChange={(c) => updateObjectProperty("fill", c)}
                    />
                    <ColorField
                      label="Stroke"
                      value={objectProperties.stroke}
                      onChange={(c) => updateObjectProperty("stroke", c)}
                    />
                    <SliderRow
                      label="Stroke width"
                      unit="px"
                      max={20}
                      value={objectProperties.strokeWidth || 0}
                      onChange={(v) => updateObjectProperty("strokeWidth", v)}
                    />
                  </>
                )}
              </Section>

              {/* Image adjustments */}
              {isImage && (
                <Section
                  icon={ImageIcon}
                  title="Image adjustments"
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1"
                      onClick={() => {
                        resetFilters(selectedObject as FabricImage);
                        setImageAdjustments(DEFAULT_IMAGE_ADJUSTMENTS);
                      }}
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset
                    </Button>
                  }
                >
                  <SliderRow label="Brightness" min={-100} max={100} value={imageAdjustments.brightness} onChange={(v) => adjust("brightness", v, setBrightness, 100)} />
                  <SliderRow label="Contrast" min={-100} max={100} value={imageAdjustments.contrast} onChange={(v) => adjust("contrast", v, setContrast, 100)} />
                  <SliderRow label="Saturation" min={-100} max={100} value={imageAdjustments.saturation} onChange={(v) => adjust("saturation", v, setSaturation, 100)} />
                  <SliderRow label="Hue" max={360} unit="°" value={imageAdjustments.hue} onChange={(v) => adjust("hue", v, setHue, 1)} />
                  <SliderRow label="Blur" max={100} value={imageAdjustments.blur} onChange={(v) => adjust("blur", v, setBlur, 100)} />
                </Section>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border py-12 px-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <MousePointerClick className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Nothing selected</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Click an element on the canvas to edit its size, color and more.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};