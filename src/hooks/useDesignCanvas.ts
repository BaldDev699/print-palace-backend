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

      // Size the canvas to whatever space its container actually has,
      // instead of a hardcoded 600px that overflows small phone screens.
      const getContainerSize = () => {
        const container = canvasRef.current?.parentElement;
        if (!container) return { width: 760, height: 480 };
        const width = Math.max(container.clientWidth - 16, 240);
        const height = Math.max(container.clientHeight - 16, 240);
        return { width, height };
      };

      const initialSize = getContainerSize();

      const canvasInstance = new FabricCanvas(canvasRef.current, {
        width: initialSize.width,
        height: initialSize.height,
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

      const applySize = () => {
        if (!canvasInstance || canvasInstance.disposed) return;
        const { width, height } = getContainerSize();
        canvasInstance.setDimensions({ width, height });
        canvasInstance.renderAll();
      };

      // ResizeObserver catches container size changes from CSS/layout
      // (orientation change, mobile browser chrome show/hide, sheet open/close)
      // which a plain window "resize" listener misses.
      const container = canvasRef.current?.parentElement;
      let resizeObserver: ResizeObserver | undefined;
      if (container && typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => applySize());
        resizeObserver.observe(container);
      }
      window.addEventListener("resize", applySize);
      window.addEventListener("orientationchange", applySize);

      return () => {
        window.removeEventListener("resize", applySize);
        window.removeEventListener("orientationchange", applySize);
        resizeObserver?.disconnect();
        if (canvasInstance && !canvasInstance.disposed) {
          canvasInstance.dispose();
          setFabricCanvas(null);
        }
      };
    },
    [],
  ); // setFabricCanvas is stable, so empty dependency array is fine.

  return {
    fabricCanvas,
    initCanvas,
  };
};
