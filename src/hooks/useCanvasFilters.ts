import { useCallback } from "react";
import { Canvas as FabricCanvas, Image as FabricImage, filters } from "fabric";

interface ImageFilters {
  brightness: number; // -1 to 1
  contrast: number; // -1 to 1
  saturation: number; // -1 to 1
  hue: number; // 0 to 360
  blur: number; // 0 to 1
}

export const useCanvasFilters = (fabricCanvas: FabricCanvas | null) => {
  const applyFilters = useCallback(
    (image: FabricImage, filterValues: Partial<ImageFilters>) => {
      if (!image) return;

      const imageFilters: any[] = [];

      // Brightness filter
      if (filterValues.brightness !== undefined && filterValues.brightness !== 0) {
        imageFilters.push(
          new filters.Brightness({
            brightness: filterValues.brightness,
          }),
        );
      }

      // Contrast filter
      if (filterValues.contrast !== undefined && filterValues.contrast !== 0) {
        imageFilters.push(
          new filters.Contrast({
            contrast: filterValues.contrast,
          }),
        );
      }

      // Saturation filter
      if (filterValues.saturation !== undefined && filterValues.saturation !== 0) {
        imageFilters.push(
          new filters.Saturation({
            saturation: filterValues.saturation,
          }),
        );
      }

      // Hue rotation filter
      if (filterValues.hue !== undefined && filterValues.hue !== 0) {
        imageFilters.push(
          new filters.HueRotation({
            rotation: filterValues.hue / 360, // Convert degrees to 0-1 range
          }),
        );
      }

      // Blur filter
      if (filterValues.blur !== undefined && filterValues.blur > 0) {
        imageFilters.push(
          new filters.Blur({
            blur: filterValues.blur,
          }),
        );
      }

      // Apply filters to image
      image.filters = imageFilters;
      image.applyFilters();
      fabricCanvas?.renderAll();
    },
    [fabricCanvas],
  );

  const setBrightness = useCallback(
    (image: FabricImage, value: number) => {
      const currentFilters = getImageFilters(image);
      applyFilters(image, { ...currentFilters, brightness: value });
    },
    [applyFilters],
  );

  const setContrast = useCallback(
    (image: FabricImage, value: number) => {
      const currentFilters = getImageFilters(image);
      applyFilters(image, { ...currentFilters, contrast: value });
    },
    [applyFilters],
  );

  const setSaturation = useCallback(
    (image: FabricImage, value: number) => {
      const currentFilters = getImageFilters(image);
      applyFilters(image, { ...currentFilters, saturation: value });
    },
    [applyFilters],
  );

  const setHue = useCallback(
    (image: FabricImage, value: number) => {
      const currentFilters = getImageFilters(image);
      applyFilters(image, { ...currentFilters, hue: value });
    },
    [applyFilters],
  );

  const setBlur = useCallback(
    (image: FabricImage, value: number) => {
      const currentFilters = getImageFilters(image);
      applyFilters(image, { ...currentFilters, blur: value });
    },
    [applyFilters],
  );

  const resetFilters = useCallback(
    (image: FabricImage) => {
      if (!image) return;

      image.filters = [];
      image.applyFilters();
      fabricCanvas?.renderAll();
    },
    [fabricCanvas],
  );

  const getImageFilters = (image: FabricImage): ImageFilters => {
    const defaultFilters: ImageFilters = {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      blur: 0,
    };

    if (!image.filters || image.filters.length === 0) {
      return defaultFilters;
    }

    const currentFilters = { ...defaultFilters };

    image.filters.forEach((filter) => {
      if (filter instanceof filters.Brightness) {
        currentFilters.brightness = (filter as any).brightness || 0;
      } else if (filter instanceof filters.Contrast) {
        currentFilters.contrast = (filter as any).contrast || 0;
      } else if (filter instanceof filters.Saturation) {
        currentFilters.saturation = (filter as any).saturation || 0;
      } else if (filter instanceof filters.HueRotation) {
        currentFilters.hue = ((filter as any).rotation || 0) * 360;
      } else if (filter instanceof filters.Blur) {
        currentFilters.blur = (filter as any).blur || 0;
      }
    });

    return currentFilters;
  };

  return {
    applyFilters,
    setBrightness,
    setContrast,
    setSaturation,
    setHue,
    setBlur,
    resetFilters,
    getImageFilters,
  };
};
