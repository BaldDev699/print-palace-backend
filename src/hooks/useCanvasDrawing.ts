import { useEffect } from "react";
import { Canvas as FabricCanvas } from "fabric";

export const useCanvasDrawing = (
  fabricCanvas: FabricCanvas | null,
  isDrawingMode: boolean,
  color: string,
) => {
  useEffect(() => {
    if (!fabricCanvas || fabricCanvas.disposed) return;

    // Set drawing mode
    fabricCanvas.isDrawingMode = isDrawingMode;
  }, [fabricCanvas, isDrawingMode]);

  useEffect(() => {
    if (!fabricCanvas || fabricCanvas.disposed || !fabricCanvas.freeDrawingBrush) return;

    // Configure the brush
    fabricCanvas.freeDrawingBrush.color = color;
    fabricCanvas.freeDrawingBrush.width = 3;
  }, [fabricCanvas, color]);

  useEffect(() => {
    if (!fabricCanvas || fabricCanvas.disposed) return;

    // Set the cursor safely
    try {
      if (isDrawingMode) {
        fabricCanvas.setCursor("crosshair");
        fabricCanvas.hoverCursor = "crosshair";
        fabricCanvas.moveCursor = "crosshair";
      } else {
        fabricCanvas.setCursor("default");
        fabricCanvas.hoverCursor = "move";
        fabricCanvas.moveCursor = "move";
      }
    } catch (error) {
      // Silently handle cursor errors on disposed canvas
    }

    fabricCanvas.renderAll();
  }, [fabricCanvas, isDrawingMode]);
};
