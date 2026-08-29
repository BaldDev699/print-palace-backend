import { RefObject, useState, useCallback } from "react";
import { Canvas as FabricCanvas } from "fabric";

export type FabricCanvasHook = {
  fabricCanvas: FabricCanvas | null;
  initCanvas: (
    canvasRef: RefObject<HTMLCanvasElement>
  ) => (() => void) | undefined;
};

const DESIGN_WIDTH = 1080;
const DESIGN_HEIGHT = 1080;

export const useDesignCanvas = (): FabricCanvasHook => {
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  const initCanvas = useCallback(
    (canvasRef: RefObject<HTMLCanvasElement>): (() => void) | undefined => {
      if (!canvasRef.current) {
        console.warn("Canvas ref not available during initCanvas.");
        return undefined;
      }

      /*
       * IMPORTANT:
       * The actual Fabric canvas is ALWAYS 1080 × 1080.
       *
       * We only scale its visual representation to fit
       * inside the available editor area.
       */
      const canvasInstance = new FabricCanvas(canvasRef.current, {
        width: DESIGN_WIDTH,
        height: DESIGN_HEIGHT,
        backgroundColor: "#ffffff",
        selectionColor: "rgba(100, 100, 255, 0.3)",
        selectionLineWidth: 2,
        preserveObjectStacking: true,
      });

      // Initialize drawing brush
      import("fabric").then(({ PencilBrush }) => {
        if (canvasInstance.disposed) return;

        canvasInstance.freeDrawingBrush = new PencilBrush(canvasInstance);
        canvasInstance.freeDrawingBrush.color = "#000000";
        canvasInstance.freeDrawingBrush.width = 3;
      });

      setFabricCanvas(canvasInstance);

      /*
       * Resize the VISUAL canvas to fit the container.
       *
       * The Fabric canvas itself remains 1080 × 1080.
       */
      const updateDisplaySize = () => {
        if (!canvasRef.current || canvasInstance.disposed) return;

        const container = canvasRef.current.parentElement;
        if (!container) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const availableWidth = Math.max(containerWidth - 32, 1);
        const availableHeight = Math.max(containerHeight - 32, 1);

        const scale = Math.min(
          availableWidth / DESIGN_WIDTH,
          availableHeight / DESIGN_HEIGHT
        );

        canvasRef.current.style.width = `${DESIGN_WIDTH * scale}px`;
        canvasRef.current.style.height = `${DESIGN_HEIGHT * scale}px`;

        canvasRef.current.style.display = "block";
        canvasRef.current.style.flexShrink = "0";

        canvasInstance.renderAll();
      };

      // Initial sizing
      requestAnimationFrame(updateDisplaySize);

      // Watch container changes
      const container = canvasRef.current.parentElement;

      let resizeObserver: ResizeObserver | undefined;

      if (container && typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => {
          updateDisplaySize();
        });

        resizeObserver.observe(container);
      }

      window.addEventListener("resize", updateDisplaySize);
      window.addEventListener("orientationchange", updateDisplaySize);

      return () => {
        window.removeEventListener("resize", updateDisplaySize);
        window.removeEventListener("orientationchange", updateDisplaySize);

        resizeObserver?.disconnect();

        if (canvasInstance && !canvasInstance.disposed) {
          canvasInstance.dispose();
          setFabricCanvas(null);
        }
      };
    },
    []
  );

  return {
    fabricCanvas,
    initCanvas,
  };
};