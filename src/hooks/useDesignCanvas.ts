import { RefObject, useState, useCallback, useRef } from "react";
import { Canvas as FabricCanvas } from "fabric";

export type FabricCanvasHook = {
  fabricCanvas: FabricCanvas | null;
  initCanvas: (
    canvasRef: RefObject<HTMLCanvasElement>
  ) => (() => void) | undefined;
  // Change the actual design resolution (e.g. picking "Instagram Story"
  // from the Canvas Size dialog). Previously this was always fixed at
  // 1080x1080 with no way to actually change it - the dialog existed but
  // selecting a size did nothing.
  setDesignSize: (width: number, height: number) => void;
  designSize: { width: number; height: number };
  // Force a re-sync of the canvas's CSS display size against its
  // container right now. Useful right after something that changes the
  // container's visible area but that ResizeObserver might not catch in
  // time for (e.g. a template picker sheet closing on mobile).
  refreshDisplaySize: () => void;
};

const DEFAULT_DESIGN_WIDTH = 1080;
const DEFAULT_DESIGN_HEIGHT = 1080;

export const useDesignCanvas = (): FabricCanvasHook => {
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [designSize, setDesignSizeState] = useState({
    width: DEFAULT_DESIGN_WIDTH,
    height: DEFAULT_DESIGN_HEIGHT,
  });

  // A ref mirror of designSize so the resize/update closures below always
  // read the latest value without needing to be re-created on every change.
  const designSizeRef = useRef(designSize);
  const updateDisplaySizeRef = useRef<() => void>(() => {});
  const canvasInstanceRef = useRef<FabricCanvas | null>(null);

  const setDesignSize = useCallback((width: number, height: number) => {
    designSizeRef.current = { width, height };
    setDesignSizeState({ width, height });

    const canvasInstance = canvasInstanceRef.current;
    if (canvasInstance && !canvasInstance.disposed) {
      canvasInstance.setDimensions({ width, height });
      canvasInstance.renderAll();
    }
    updateDisplaySizeRef.current();
  }, []);

  const refreshDisplaySize = useCallback(() => {
    updateDisplaySizeRef.current();
  }, []);

  const initCanvas = useCallback(
    (canvasRef: RefObject<HTMLCanvasElement>): (() => void) | undefined => {
      if (!canvasRef.current) {
        console.warn("Canvas ref not available during initCanvas.");
        return undefined;
      }

      const { width: initialWidth, height: initialHeight } = designSizeRef.current;

      /*
       * The actual Fabric canvas has a fixed logical resolution (the real
       * design/export size, changeable via setDesignSize / the Canvas Size
       * dialog). We only scale its VISUAL representation to fit inside the
       * available editor area - the underlying coordinate space users are
       * drawing into never silently shifts just because the browser window
       * or mobile viewport resizes.
       */
      const canvasInstance = new FabricCanvas(canvasRef.current, {
        width: initialWidth,
        height: initialHeight,
        backgroundColor: "#ffffff",
        selectionColor: "rgba(100, 100, 255, 0.3)",
        selectionLineWidth: 2,
        preserveObjectStacking: true,
      });
      canvasInstanceRef.current = canvasInstance;

      // Initialize drawing brush
      import("fabric").then(({ PencilBrush }) => {
        if (canvasInstance.disposed) return;

        canvasInstance.freeDrawingBrush = new PencilBrush(canvasInstance);
        canvasInstance.freeDrawingBrush.color = "#000000";
        canvasInstance.freeDrawingBrush.width = 3;
      });

      setFabricCanvas(canvasInstance);

      /*
       * Resize the VISUAL canvas to fit the container, preserving the
       * design's real aspect ratio (which may not be square, once
       * setDesignSize is used to pick a non-square preset like Instagram
       * Story).
       */
      const updateDisplaySize = () => {
        if (!canvasRef.current || canvasInstance.disposed) return;

        const container = canvasRef.current.parentElement;
        if (!container) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const availableWidth = Math.max(containerWidth - 32, 1);
        const availableHeight = Math.max(containerHeight - 32, 1);

        const { width: targetWidth, height: targetHeight } = designSizeRef.current;

        const scale = Math.min(
          availableWidth / targetWidth,
          availableHeight / targetHeight
        );

        canvasRef.current.style.width = `${targetWidth * scale}px`;
        canvasRef.current.style.height = `${targetHeight * scale}px`;

        canvasRef.current.style.display = "block";
        canvasRef.current.style.flexShrink = "0";

        canvasInstance.renderAll();
      };
      updateDisplaySizeRef.current = updateDisplaySize;

      // Initial sizing. A single requestAnimationFrame can still fire
      // before mobile browsers finish settling the container's real
      // layout (address bar show/hide, sheet open/close animations,
      // dynamic viewport units) - and since ResizeObserver below only
      // reacts to subsequent size CHANGES, a wrong first measurement had
      // nothing to ever correct it, silently leaving the canvas mis-sized.
      // Chain two rAFs (lets one full paint cycle complete first) plus a
      // short settle timeout as a belt-and-suspenders fallback.
      requestAnimationFrame(() => {
        requestAnimationFrame(updateDisplaySize);
      });
      const settleTimeout = setTimeout(updateDisplaySize, 250);

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
        clearTimeout(settleTimeout);

        if (canvasInstance && !canvasInstance.disposed) {
          canvasInstance.dispose();
          setFabricCanvas(null);
        }
        canvasInstanceRef.current = null;
      };
    },
    []
  );

  return {
    fabricCanvas,
    initCanvas,
    setDesignSize,
    designSize,
    refreshDisplaySize,
  };
};
