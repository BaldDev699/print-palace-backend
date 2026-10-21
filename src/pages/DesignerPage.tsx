import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Link, useLocation } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DesignCanvas } from "@/components/designer/DesignCanvas";
import { DesignSidebar } from "@/components/designer/DesignSidebar";
import { InspectorPanel } from "@/components/designer/InspectorPanel";
import { OrderSubmission } from "@/components/designer/OrderSubmission";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Canvas as FabricCanvas } from "fabric";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";
import {
  Wrench,
  Sliders,
  Type,
  Image as ImageIcon,
  Shapes,
  Palette,
} from "lucide-react";

const MobileNavItem = ({
  icon: Icon,
  label,
  onClick,
  active = false,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center gap-1 rounded-xl py-2.5 text-[10px] font-medium transition-all active:scale-95",
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground",
    )}
  >
    <Icon className="h-5 w-5" />
    {label}
  </button>
);

const DesignerPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [measurements, setMeasurements] = useState<Record<string, number>>({});
  const [productType, setProductType] = useState<string>("");

  const [activeTool, setActiveTool] = useState("select");
  const [drawingColor] = useState("#000000");
  const [mockupColor, setMockupColor] = useState("#ffffff");
  const [currentMockup] = useState<any>(null);
  const [printingMethod, setPrintingMethod] = useState<string>("DTG");

  const [toolsSheetOpen, setToolsSheetOpen] = useState(false);
  const [inspectorSheetOpen, setInspectorSheetOpen] = useState(false);

  // Radix Dialog/Sheet/Popover content renders via a portal attached
  // directly to document.body, outside this page's own DOM tree - so a
  // theme class applied only to this page's root div wouldn't reach them,
  // leaving things like the Choose Template dialog stuck in the light
  // theme. Toggling the class on body itself while this page is mounted
  // covers both cases, and removing it on unmount keeps the rest of the
  // site completely unaffected.
  useEffect(() => {
    document.body.classList.add("designer-dark");
    return () => {
      document.body.classList.remove("designer-dark");
    };
  }, []);

  // If we got here via the "Edit" button on a saved design
  // (/designer?id=...), load that design's actual editable canvas state
  // back onto the canvas.
  useEffect(() => {
    if (!fabricCanvas) return;
    const params = new URLSearchParams(location.search);
    const designId = params.get("id");
    if (!designId) return;

    const existingDesigns = JSON.parse(localStorage.getItem("savedDesigns") || "[]");
    const design = existingDesigns.find((d: any) => d.id === designId);

    if (!design) {
      toast.error("Couldn't find that saved design.");
      return;
    }
    if (!design.canvasJSON) {
      toast.error(
        "This design was saved before editing was supported, so it can't be reopened for editing. You can delete it and start a new one.",
      );
      return;
    }

    // The template drawer auto-opens on canvas init - close it since we're
    // restoring an existing design, not starting a fresh one.
    (window as any).designCanvasAPI?.setIsTemplateDrawerOpen?.(false);

    fabricCanvas.loadFromJSON(design.canvasJSON).then(() => {
      fabricCanvas.renderAll();
      toast.success(`Loaded "${design.name}" for editing.`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabricCanvas]);

  const handleProceedToCheckout = () => {
    if (!user) {
      toast.error("Please sign in to proceed with checkout");
      return;
    }
    if (!fabricCanvas) {
      toast.error("Please create a design first");
      return;
    }
    const objects = fabricCanvas.getObjects();
    const hasUserContent = objects.some((obj) => !(obj as any).data?.isMockup);
    if (!hasUserContent) {
      toast.error("Please add some design elements before checkout");
      return;
    }
    if (!productType) {
      toast.error("Please select a product template first");
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleSaveDesign = () => {
    if (!fabricCanvas) return;
    const thumbnail = fabricCanvas.toDataURL({ format: "png", quality: 0.8, multiplier: 0.5 });
    const currentDate = new Date().toISOString().split("T")[0];
    // Store the actual editable canvas state (not just a flat thumbnail)
    // so this design can be loaded back onto the canvas via the load
    // effect above, when the user clicks "Edit" from their profile page.
    const canvasJSON = fabricCanvas.toObject(["data", "name", "id"]);
    const newDesign = {
      id: `design-${Date.now()}`,
      name: `Design ${new Date().toLocaleTimeString()}`,
      imageUrl: thumbnail,
      lastEdited: currentDate,
      canvasJSON,
    };
    const existingDesigns = JSON.parse(localStorage.getItem("savedDesigns") || "[]");
    localStorage.setItem("savedDesigns", JSON.stringify([newDesign, ...existingDesigns]));
    toast.success("Design saved successfully!");
  };

  const handleClearCanvas = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();
    toast.info("Canvas cleared!");
  };

  const handleToolClick = (tool: string) => {
    setActiveTool(tool);
    if ((window as any).designCanvasAPI) {
      (window as any).designCanvasAPI.handleToolClick(tool);
    }
  };

  const handleAddText = () => (window as any).designCanvasAPI?.handleAddText();
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) =>
    (window as any).designCanvasAPI?.handleImageUpload(e);
  const handleOpenShapeLibrary = () =>
    (window as any).designCanvasAPI?.setIsShapeLibraryOpen(true);
  const handleOpenSuggestedDesigns = () =>
    (window as any).designCanvasAPI?.setIsSuggestedDesignsOpen(true);
  const handleOpenTemplates = () =>
    (window as any).designCanvasAPI?.setIsTemplateDrawerOpen(true);
  const handleOpenCollageTemplates = () =>
    (window as any).designCanvasAPI?.setIsCollageTemplatesOpen?.(true);
  const handleOpenPreview = () =>
    (window as any).designCanvasAPI?.setIsPreviewSheetOpen?.(true);

  // The sidebar component (reused for desktop rail and mobile sheet)
  const sidebar = (
    <DesignSidebar
      activeTool={activeTool as any}
      onToolClick={handleToolClick}
      onAddText={handleAddText}
      onImageUpload={handleImageUpload}
      onClear={handleClearCanvas}
      onOpenShapeLibrary={handleOpenShapeLibrary}
      onOpenSuggestedDesigns={handleOpenSuggestedDesigns}
      onOpenTemplates={handleOpenTemplates}
      onSaveDesign={handleSaveDesign}
      fabricCanvas={fabricCanvas}
      onPrintingMethodSelect={setPrintingMethod}
      onOpenCollageTemplates={handleOpenCollageTemplates}
    />
  );

  const inspector = (
    <InspectorPanel
      fabricCanvas={fabricCanvas}
      currentMockup={currentMockup}
      mockupColor={mockupColor}
      onMockupColorChange={setMockupColor}
    />
  );

  return (
    <div className="designer-dark flex flex-col h-[100dvh] overflow-hidden md:h-auto md:min-h-screen md:overflow-visible bg-background text-foreground">
      <Header />

      {/* Top action bar */}
      <div className="px-3 md:px-6 py-3 border-b border-border bg-card/60">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-lg md:text-xl font-bold leading-tight">Design Studio</h1>
            <p className="hidden sm:block text-xs text-muted-foreground">
              Pick a template, add your artwork, then send it to a manufacturer.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/">Home</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="md:hidden"
              onClick={handleOpenPreview}
            >
              Preview
            </Button>
            <Button variant="outline" size="sm" onClick={handleSaveDesign}>
              Save
            </Button>
            <Button size="sm" onClick={handleProceedToCheckout}>
              Checkout
            </Button>
          </div>
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex flex-1 overflow-y-auto md:overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:flex">{sidebar}</div>

        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-3 md:p-6 flex flex-col min-h-0 pb-28 md:pb-6">
            <DesignCanvas
              onCanvasReady={setFabricCanvas}
              onMeasurementsChange={setMeasurements}
              onProductTypeChange={setProductType}
              activeTool={activeTool}
              onToolChange={setActiveTool}
              drawingColor={drawingColor}
              mockupColor={mockupColor}
              onMockupColorChange={setMockupColor}
              currentMockup={currentMockup}
            />
          </div>
        </main>

        {/* Desktop inspector */}
        <div className="hidden lg:flex">{inspector}</div>
      </div>

      {/* Mobile bottom toolbar: floating pill */}
      <div className="md:hidden fixed bottom-3 inset-x-3 z-40 rounded-2xl border border-border bg-card shadow-2xl pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-6 gap-1 p-1.5">
          <MobileNavItem
            icon={Wrench}
            label="Tools"
            active={toolsSheetOpen}
            onClick={() => setToolsSheetOpen(true)}
          />
          <MobileNavItem icon={Palette} label="Templates" onClick={handleOpenTemplates} />
          <MobileNavItem icon={Type} label="Text" onClick={handleAddText} />
          <MobileNavItem
            icon={ImageIcon}
            label="Image"
            onClick={() => document.getElementById("image-upload")?.click()}
          />
          <MobileNavItem icon={Shapes} label="Shapes" onClick={handleOpenShapeLibrary} />
          <MobileNavItem
            icon={Sliders}
            label="Props"
            active={inspectorSheetOpen}
            onClick={() => setInspectorSheetOpen(true)}
          />
        </div>
      </div>

      {/* Sheets (opened from the bar above) */}
      <Sheet open={toolsSheetOpen} onOpenChange={setToolsSheetOpen}>
        <SheetContent side="bottom" className="h-[80vh] p-0 rounded-t-2xl md:hidden">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Design Tools</SheetTitle>
          </SheetHeader>
          <div className="h-full overflow-hidden">{sidebar}</div>
        </SheetContent>
      </Sheet>

      <Sheet open={inspectorSheetOpen} onOpenChange={setInspectorSheetOpen}>
        <SheetContent side="bottom" className="h-[70vh] p-0 rounded-t-2xl md:hidden">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Properties</SheetTitle>
          </SheetHeader>
          <div className="h-full overflow-auto">{inspector}</div>
        </SheetContent>
      </Sheet>

      <div className="hidden md:block">
        <Footer />
      </div>

      {isCheckoutOpen && (
        <OrderSubmission
          fabricCanvas={fabricCanvas}
          measurements={measurements}
          productType={productType}
          printingMethod={printingMethod}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}
    </div>
  );
};

export default DesignerPage;