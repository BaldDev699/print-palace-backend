import { Canvas as FabricCanvas, Textbox } from "fabric";
import { toast } from "sonner";

export const useCanvasText = (fabricCanvas: FabricCanvas | null) => {
  const addText = (color: string) => {
    if (!fabricCanvas) return;

    const textbox = new Textbox("Your Text Here", {
      left: 50,
      top: 50,
      width: 200,
      fontSize: 24,
      fill: color,
      hasControls: true,
      hasBorders: true,
      editable: true,
    });

    fabricCanvas.add(textbox);
    fabricCanvas.setActiveObject(textbox);
    fabricCanvas.renderAll();
    toast.info("Text added! Double-click to edit.");
  };

  return { addText };
};
