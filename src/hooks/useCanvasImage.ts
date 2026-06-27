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

      // Options object passed as the second argument
      // The value 'anonymous' is a valid TCrossOrigin type.
      const imageOptions: LoadImageOptions = { crossOrigin: "anonymous" };

      // Callback function passed as the third argument
      FabricImage.fromURL(data, imageOptions, (img: any) => {
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
      });
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return { handleImageUpload };
};
