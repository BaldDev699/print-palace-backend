import { RefObject, useState, useCallback } from "react"; // Added useCallback
import { Canvas as FabricCanvas } from "fabric";

export type FabricCanvasHook = {
  fabricCanvas: FabricCanvas | null;
  initCanvas: (canvasRef: RefObject<HTMLCanvasElement>) => (() => void) | undefined;
};

export const useDesignCanvas = (): FabricCanvasHook => {
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  const initCanvas = useCallback(
    (canvasRef: RefObject<HTMLCanvasElement>): (() => void) | undefined => {
      if (!canvasRef.current) {
        console.warn("Canvas ref not available during initCanvas.");
        return undefined;
      }

      const canvasInstance = new FabricCanvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: "#ffffff",
        selectionColor: "rgba(100, 100, 255, 0.3)",
        selectionLineWidth: 2,
        preserveObjectStacking: true,
      });

      // Initialize the freeDrawingBrush properly with PencilBrush
      import("fabric").then(({ PencilBrush }) => {
        canvasInstance.freeDrawingBrush = new PencilBrush(canvasInstance);
        canvasInstance.freeDrawingBrush.color = "#000000";
        canvasInstance.freeDrawingBrush.width = 3;
      });

      setFabricCanvas(canvasInstance);

      const handleResize = () => {
        const container = canvasRef.current?.parentElement;
        if (container && canvasInstance) {
          canvasInstance.setDimensions({
            width: container.clientWidth,
            height: container.clientHeight > 300 ? container.clientHeight : 600,
          });
          canvasInstance.renderAll();
        }
      };

      const parentElement = canvasRef.current?.parentElement;
      if (parentElement) {
        const initialWidth = parentElement.clientWidth > 50 ? parentElement.clientWidth - 40 : 760;
        const initialHeight = 600;
        canvasInstance.setDimensions({ width: initialWidth, height: initialHeight });
        canvasInstance.renderAll();
      }

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        if (canvasInstance && !canvasInstance.disposed) {
          canvasInstance.dispose();
          setFabricCanvas(null);
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [],
  ); // setFabricCanvas is stable, so empty dependency array is fine.

  return {
    fabricCanvas,
    initCanvas,
  };
};
