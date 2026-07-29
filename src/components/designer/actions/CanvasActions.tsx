import React from "react";
import { Button } from "@/components/ui/button";
import { Canvas as FabricCanvas } from "fabric";
import { toast } from "sonner";
import { useNavigate } from "@/lib/router-compat";

interface CanvasActionsProps {
  fabricCanvas: FabricCanvas | null;
}

export const CanvasActions: React.FC<CanvasActionsProps> = ({ fabricCanvas }) => {
  const navigate = useNavigate();

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();
    toast.info("Canvas cleared!");
  };

  const handleSaveDesign = () => {
    if (!fabricCanvas) return;

    // Generate a thumbnail from the canvas
    const thumbnail = fabricCanvas.toDataURL({
      format: "png",
      quality: 0.8,
      multiplier: 0.5,
    });

    // Get current date for the "last edited" info
    const currentDate = new Date().toISOString().split("T")[0];

    // Store the actual editable canvas state (not just a flat image) so
    // this design can be loaded back onto the canvas for real editing
    // later, via the "Edit" button on the profile page.
    const canvasJSON = fabricCanvas.toObject(["data", "name", "id"]);

    // Create a new design object
    const newDesign = {
      id: `design-${Date.now()}`,
      name: `Design ${new Date().toLocaleTimeString()}`,
      imageUrl: thumbnail,
      lastEdited: currentDate,
      canvasJSON,
    };

    // Get existing designs from localStorage or initialize empty array
    const existingDesigns = JSON.parse(localStorage.getItem("savedDesigns") || "[]");

    // Add new design to the beginning of the array
    const updatedDesigns = [newDesign, ...existingDesigns];

    // Save to localStorage
    localStorage.setItem("savedDesigns", JSON.stringify(updatedDesigns));

    toast.success("Design saved successfully!", {
      action: {
        label: "View in Profile",
        onClick: () => navigate("/profile"),
      },
    });
  };

  return (
    <div className="flex justify-between items-center w-full">
      <Button variant="outline" onClick={handleClear}>
        Clear Canvas
      </Button>
      <Button onClick={handleSaveDesign} size="lg">
        Save Design
      </Button>
    </div>
  );
};
