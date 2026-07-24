import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DesignCanvas } from "@/components/designer/DesignCanvas";
import { DesignSidebar } from "@/components/designer/DesignSidebar";
import { InspectorPanel } from "@/components/designer/InspectorPanel";
import { OrderSubmission } from "@/components/designer/OrderSubmission";
import { useAuth } from "@/contexts/AuthContext";
import { Canvas as FabricCanvas } from "fabric";
import { toast } from "sonner";
import {
  Wrench,
  Sliders,
  Type,
  Image as ImageIcon,
  Shapes,
  Layout,
  Palette,
} from "lucide-react";

const DesignerPage = () => {
  const { user } = useAuth();
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
    const newDesign = {
      id: `design-${Date.now()}`,
      name: `Design ${new Date().toLocaleTimeString()}`,
      imageUrl: thumbnail,
      lastEdited: currentDate,
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
    <div className="flex flex-col h-[100dvh] overflow-hidden md:h-auto md:min-h-screen md:overflow-visible bg-background">
      <Header />

      {/* Top action bar */}
      <div className="p-3 md:p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Product Designer - TES 12345</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">Home</Link>
            </Button>
            <Button size="sm" onClick={handleProceedToCheckout}>
              Checkout
            </Button>
          </div>
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:flex">{sidebar}</div>

        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-3 md:p-6 flex flex-col min-h-0 pb-24 md:pb-6">
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

      {/* Mobile bottom toolbar (Picsart-style) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border shadow-lg pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-7 gap-0">
          <Sheet open={toolsSheetOpen} onOpenChange={setToolsSheetOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center gap-1 py-2.5 text-xs text-foreground hover:bg-muted">
                <Wrench className="h-5 w-5" />
                Tools
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Design Tools</SheetTitle>
              </SheetHeader>
              <div className="h-full overflow-hidden">{sidebar}</div>
            </SheetContent>
          </Sheet>

          <button
            className="flex flex-col items-center gap-1 py-2.5 text-xs text-foreground hover:bg-muted"
            onClick={handleOpenTemplates}
          >
            <Palette className="h-5 w-5" />
            Templates
          </button>

          <button
            className="flex flex-col items-center gap-1 py-2.5 text-xs text-foreground hover:bg-muted"
            onClick={handleAddText}
          >
            <Type className="h-5 w-5" />
            Text
          </button>

          <button
            className="flex flex-col items-center gap-1 py-2.5 text-xs text-foreground hover:bg-muted"
            onClick={() => document.getElementById("image-upload")?.click()}
          >
            <ImageIcon className="h-5 w-5" />
            Image
          </button>

          <button
            className="flex flex-col items-center gap-1 py-2.5 text-xs text-foreground hover:bg-muted"
            onClick={handleOpenShapeLibrary}
          >
            <Shapes className="h-5 w-5" />
            Shapes
          </button>

          <Sheet open={inspectorSheetOpen} onOpenChange={setInspectorSheetOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center gap-1 py-2.5 text-xs text-foreground hover:bg-muted">
                <Sliders className="h-5 w-5" />
                Props
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Properties</SheetTitle>
              </SheetHeader>
              <div className="h-full overflow-auto">{inspector}</div>
            </SheetContent>
          </Sheet>

          <button
            className="flex flex-col items-center gap-1 py-2.5 text-xs text-foreground hover:bg-muted"
            onClick={handleOpenPreview}
          >
            <Layout className="h-5 w-5" />
            Preview
          </button>
        </div>
      </div>

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
