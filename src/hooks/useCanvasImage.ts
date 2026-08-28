import { Canvas as FabricCanvas, Image as FabricImage, TCrossOrigin } from "fabric";
import { toast } from "sonner";

// Fabric.js type for image loading options.
// TCrossOrigin is imported from fabric for type safety.
interface LoadImageOptions {
  crossOrigin?: TCrossOrigin;
  // other options can be added here if known
}

export const useCanvasImage = (fabricCanvas: FabricCanvas | null) => {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!fabricCanvas || !event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (f) => {
      const data = f.target?.result as string;
      if (!data) return;

      const imageOptions: LoadImageOptions = { crossOrigin: "anonymous" };

      FabricImage.fromURL(data, imageOptions)
        .then((img) => {
          if (!img) {
            toast.error("Failed to load image onto canvas.");
            return;
          }

          // Fit to a reasonable portion of the canvas instead of a fixed
          // 50% scale - a large photo (e.g. straight from a phone camera)
          // at 50% of its original size can still be far bigger than the
          // canvas itself, covering the whole design area.
          const canvasWidth = fabricCanvas.getWidth();
          const canvasHeight = fabricCanvas.getHeight();
          const maxWidth = canvasWidth * 0.45;
          const maxHeight = canvasHeight * 0.45;
          const naturalWidth = img.width || maxWidth;
          const naturalHeight = img.height || maxHeight;
          const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1);

          img.set({
            left: 100,
            top: 100,
            scaleX: scale,
            scaleY: scale,
            hasControls: true,
            hasBorders: true,
          });
          fabricCanvas.add(img);
          fabricCanvas.centerObject(img);
          img.setCoords();
          fabricCanvas.setActiveObject(img);
          fabricCanvas.renderAll();
          toast.success("Image added to canvas!");
        })
        .catch((err) => {
          console.error("Failed to load uploaded image:", err);
          toast.error("Failed to load image onto canvas.");
        });
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return { handleImageUpload };
};
