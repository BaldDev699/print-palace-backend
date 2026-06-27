import { useCallback, useEffect, useState } from "react";
import { Canvas as FabricCanvas, Line, FabricObject } from "fabric";

interface GuideLines {
  vertical: Line[];
  horizontal: Line[];
}

export const useCanvasGuides = (fabricCanvas: FabricCanvas | null) => {
  const [guides, setGuides] = useState<GuideLines>({ vertical: [], horizontal: [] });
  const [snapThreshold] = useState(8); // pixels
  const [isEnabled, setIsEnabled] = useState(true);

  // Create a guide line
  const createGuideLine = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    return new Line([x1, y1, x2, y2], {
      stroke: "#ff6b6b",
      strokeWidth: 1,
      strokeDashArray: [3, 3],
      selectable: false,
      evented: false,
      excludeFromExport: true,
      opacity: 0.8,
    });
  }, []);

  // Clear all guide lines
  const clearGuides = useCallback(() => {
    if (!fabricCanvas) return;

    guides.vertical.forEach((line) => fabricCanvas.remove(line));
    guides.horizontal.forEach((line) => fabricCanvas.remove(line));

    setGuides({ vertical: [], horizontal: [] });
    fabricCanvas.renderAll();
  }, [fabricCanvas, guides]);

  // Calculate snap positions
  const getSnapPositions = useCallback(
    (movingObject: FabricObject) => {
      if (!fabricCanvas || !isEnabled) return { x: null, y: null };

      const canvasWidth = fabricCanvas.width || 0;
      const canvasHeight = fabricCanvas.height || 0;
      const objects = fabricCanvas
        .getObjects()
        .filter((obj) => obj !== movingObject && !(obj as any).excludeFromExport && obj.visible);

      const movingBounds = movingObject.getBoundingRect();
      const movingCenterX = movingBounds.left + movingBounds.width / 2;
      const movingCenterY = movingBounds.top + movingBounds.height / 2;

      let snapX: number | null = null;
      let snapY: number | null = null;
      let minXDistance = snapThreshold + 1;
      let minYDistance = snapThreshold + 1;

      // Canvas center snapping
      const canvasCenterX = canvasWidth / 2;
      const canvasCenterY = canvasHeight / 2;

      if (
        Math.abs(movingCenterX - canvasCenterX) <= snapThreshold &&
        Math.abs(movingCenterX - canvasCenterX) < minXDistance
      ) {
        snapX = canvasCenterX - movingBounds.width / 2;
        minXDistance = Math.abs(movingCenterX - canvasCenterX);
      }

      if (
        Math.abs(movingCenterY - canvasCenterY) <= snapThreshold &&
        Math.abs(movingCenterY - canvasCenterY) < minYDistance
      ) {
        snapY = canvasCenterY - movingBounds.height / 2;
        minYDistance = Math.abs(movingCenterY - canvasCenterY);
      }

      // Object-to-object snapping
      objects.forEach((obj) => {
        const bounds = obj.getBoundingRect();
        const objCenterX = bounds.left + bounds.width / 2;
        const objCenterY = bounds.top + bounds.height / 2;

        // Vertical alignment (centers)
        const xDistance = Math.abs(movingCenterX - objCenterX);
        if (xDistance <= snapThreshold && xDistance < minXDistance) {
          snapX = objCenterX - movingBounds.width / 2;
          minXDistance = xDistance;
        }

        // Horizontal alignment (centers)
        const yDistance = Math.abs(movingCenterY - objCenterY);
        if (yDistance <= snapThreshold && yDistance < minYDistance) {
          snapY = objCenterY - movingBounds.height / 2;
          minYDistance = yDistance;
        }

        // Edge snapping
        const edges = {
          left: bounds.left,
          right: bounds.left + bounds.width,
          top: bounds.top,
          bottom: bounds.top + bounds.height,
        };

        const movingEdges = {
          left: movingBounds.left,
          right: movingBounds.left + movingBounds.width,
          top: movingBounds.top,
          bottom: movingBounds.top + movingBounds.height,
        };

        // Left-to-right edge snapping
        if (Math.abs(movingEdges.left - edges.right) <= snapThreshold) {
          const distance = Math.abs(movingEdges.left - edges.right);
          if (distance < minXDistance) {
            snapX = edges.right;
            minXDistance = distance;
          }
        }

        // Right-to-left edge snapping
        if (Math.abs(movingEdges.right - edges.left) <= snapThreshold) {
          const distance = Math.abs(movingEdges.right - edges.left);
          if (distance < minXDistance) {
            snapX = edges.left - movingBounds.width;
            minXDistance = distance;
          }
        }

        // Top-to-bottom edge snapping
        if (Math.abs(movingEdges.top - edges.bottom) <= snapThreshold) {
          const distance = Math.abs(movingEdges.top - edges.bottom);
          if (distance < minYDistance) {
            snapY = edges.bottom;
            minYDistance = distance;
          }
        }

        // Bottom-to-top edge snapping
        if (Math.abs(movingEdges.bottom - edges.top) <= snapThreshold) {
          const distance = Math.abs(movingEdges.bottom - edges.top);
          if (distance < minYDistance) {
            snapY = edges.top - movingBounds.height;
            minYDistance = distance;
          }
        }
      });

      return { x: snapX, y: snapY };
    },
    [fabricCanvas, isEnabled, snapThreshold],
  );

  // Show guide lines
  const showGuides = useCallback(
    (object: FabricObject) => {
      if (!fabricCanvas || !isEnabled) return;

      clearGuides();

      const bounds = object.getBoundingRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const canvasWidth = fabricCanvas.width || 0;
      const canvasHeight = fabricCanvas.height || 0;

      const newGuides: GuideLines = { vertical: [], horizontal: [] };

      // Show vertical center guide if near canvas center
      if (Math.abs(centerX - canvasWidth / 2) <= snapThreshold) {
        const vLine = createGuideLine(canvasWidth / 2, 0, canvasWidth / 2, canvasHeight);
        newGuides.vertical.push(vLine);
        fabricCanvas.add(vLine);
      }

      // Show horizontal center guide if near canvas center
      if (Math.abs(centerY - canvasHeight / 2) <= snapThreshold) {
        const hLine = createGuideLine(0, canvasHeight / 2, canvasWidth, canvasHeight / 2);
        newGuides.horizontal.push(hLine);
        fabricCanvas.add(hLine);
      }

      // Show guides for object alignment
      const objects = fabricCanvas
        .getObjects()
        .filter((obj) => obj !== object && !(obj as any).excludeFromExport && obj.visible);

      objects.forEach((obj) => {
        const objBounds = obj.getBoundingRect();
        const objCenterX = objBounds.left + objBounds.width / 2;
        const objCenterY = objBounds.top + objBounds.height / 2;

        // Vertical alignment guide
        if (Math.abs(centerX - objCenterX) <= snapThreshold) {
          const vLine = createGuideLine(objCenterX, 0, objCenterX, canvasHeight);
          newGuides.vertical.push(vLine);
          fabricCanvas.add(vLine);
        }

        // Horizontal alignment guide
        if (Math.abs(centerY - objCenterY) <= snapThreshold) {
          const hLine = createGuideLine(0, objCenterY, canvasWidth, objCenterY);
          newGuides.horizontal.push(hLine);
          fabricCanvas.add(hLine);
        }
      });

      setGuides(newGuides);
      fabricCanvas.renderAll();
    },
    [fabricCanvas, isEnabled, snapThreshold, clearGuides, createGuideLine],
  );

  // Setup event listeners
  useEffect(() => {
    if (!fabricCanvas || !isEnabled) return;

    const handleObjectMoving = (e: any) => {
      const object = e.target;
      const snapPos = getSnapPositions(object);

      if (snapPos.x !== null) {
        object.set({ left: snapPos.x });
      }
      if (snapPos.y !== null) {
        object.set({ top: snapPos.y });
      }

      showGuides(object);
    };

    const handleObjectMoved = () => {
      clearGuides();
    };

    const handleSelectionCleared = () => {
      clearGuides();
    };

    fabricCanvas.on("object:moving", handleObjectMoving);
    fabricCanvas.on("mouse:up", handleObjectMoved);
    fabricCanvas.on("selection:cleared", handleSelectionCleared);

    return () => {
      fabricCanvas.off("object:moving", handleObjectMoving);
      fabricCanvas.off("mouse:up", handleObjectMoved);
      fabricCanvas.off("selection:cleared", handleSelectionCleared);
      clearGuides();
    };
  }, [fabricCanvas, isEnabled, getSnapPositions, showGuides, clearGuides]);

  const toggleGuides = useCallback(() => {
    setIsEnabled((prev) => !prev);
    if (!isEnabled) {
      clearGuides();
    }
  }, [isEnabled, clearGuides]);

  return {
    isEnabled,
    toggleGuides,
    clearGuides,
    snapThreshold,
  };
};
