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

      // fromURL returns a Promise<FabricImage> in this Fabric version - it
      // does not take a completion callback as a third argument. Passing a
      // callback there (as the previous implementation did) meant it was
      // silently ignored, the Promise was never awaited, and uploaded
      // images never actually got added to the canvas.
      FabricImage.fromURL(data, imageOptions)
        .then((img) => {
          if (!img) {
            toast.error("Failed to load image onto canvas.");
            return;
          }
          img.set({
            left: 100,
            top: 100,
            scaleX: 0.5,
            scaleY: 0.5,
            hasControls: true,
            hasBorders: true,
          });
          fabricCanvas.add(img);
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
