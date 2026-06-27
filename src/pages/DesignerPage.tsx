import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { DesignCanvas } from "@/components/designer/DesignCanvas";
import { DesignSidebar } from "@/components/designer/DesignSidebar";
import { InspectorPanel } from "@/components/designer/InspectorPanel";
import { OrderSubmission } from "@/components/designer/OrderSubmission";
import { useAuth } from "@/contexts/AuthContext";
import { Canvas as FabricCanvas } from "fabric";
import { toast } from "sonner";

const DesignerPage = () => {
  const { user } = useAuth();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [measurements, setMeasurements] = useState<Record<string, number>>({});
  const [productType, setProductType] = useState<string>("");

  // New state for design interface
  const [activeTool, setActiveTool] = useState("select");
  const [drawingColor, setDrawingColor] = useState("#000000");
  const [mockupColor, setMockupColor] = useState("#ffffff");
  const [currentMockup, setCurrentMockup] = useState<any>(null);
  const [printingMethod, setPrintingMethod] = useState<string>("DTG");

  const handleProceedToCheckout = () => {
    if (!user) {
      toast.error("Please sign in to proceed with checkout");
      return;
    }

    if (!fabricCanvas) {
      toast.error("Please create a design first");
      return;
    }

    // Check if canvas has any user-created content (not just mockup)
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

    const thumbnail = fabricCanvas.toDataURL({
      format: "png",
      quality: 0.8,
      multiplier: 0.5,
    });

    const currentDate = new Date().toISOString().split("T")[0];
    const newDesign = {
      id: `design-${Date.now()}`,
      name: `Design ${new Date().toLocaleTimeString()}`,
      imageUrl: thumbnail,
      lastEdited: currentDate,
    };

    const existingDesigns = JSON.parse(localStorage.getItem("savedDesigns") || "[]");
    const updatedDesigns = [newDesign, ...existingDesigns];
    localStorage.setItem("savedDesigns", JSON.stringify(updatedDesigns));

    toast.success("Design saved successfully!");
  };

  const handleClearCanvas = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();
    toast.info("Canvas cleared!");
  };

  // Sidebar event handlers
  const handleToolClick = (tool: string) => {
    setActiveTool(tool);
    if ((window as any).designCanvasAPI) {
      (window as any).designCanvasAPI.handleToolClick(tool);
    }
  };

  const handleAddText = () => {
    if ((window as any).designCanvasAPI) {
      (window as any).designCanvasAPI.handleAddText();
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if ((window as any).designCanvasAPI) {
      (window as any).designCanvasAPI.handleImageUpload(event);
    }
  };

  const handleOpenShapeLibrary = () => {
    if ((window as any).designCanvasAPI) {
      (window as any).designCanvasAPI.setIsShapeLibraryOpen(true);
    }
  };

  const handleOpenSuggestedDesigns = () => {
    if ((window as any).designCanvasAPI) {
      (window as any).designCanvasAPI.setIsSuggestedDesignsOpen(true);
    }
  };

  const handleOpenTemplates = () => {
    if ((window as any).designCanvasAPI) {
      (window as any).designCanvasAPI.setIsTemplateDrawerOpen(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
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
          onOpenCollageTemplates={() => {
            if ((window as any).designCanvasAPI) {
              (window as any).designCanvasAPI.setIsCollageTemplatesOpen?.(true);
            }
          }}
        />

        <main className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border bg-card">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">Product Designer</h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" asChild>
                  <Link to="/">Back to Home</Link>
                </Button>
                <Button size="lg" onClick={handleProceedToCheckout}>
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 flex flex-col min-h-0">
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

        <InspectorPanel
          fabricCanvas={fabricCanvas}
          currentMockup={currentMockup}
          mockupColor={mockupColor}
          onMockupColorChange={setMockupColor}
        />
      </div>
      <Footer />

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
