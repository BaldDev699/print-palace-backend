import { useState, useCallback } from 'react';
import { Canvas as FabricCanvas, Rect, Image as FabricImage, TCrossOrigin } from 'fabric';
import { toast } from 'sonner';
import type { CollageLayout } from '@/components/designer/collage/CollageTemplates';

export interface CollageFrame {
  id: string;
  rect: Rect;
  imageUrl?: string;
  image?: FabricImage;
}

export const useCollageFrames = (fabricCanvas: FabricCanvas | null) => {
  const [frames, setFrames] = useState<Map<string, CollageFrame>>(new Map());
  const [gutter, setGutter] = useState(12);
  const [cornerRadius, setCornerRadius] = useState(16);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  const generateFrameId = () => `frame_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const calculateFrameBounds = useCallback((cell: any, canvasWidth: number, canvasHeight: number) => {
    const gutterOffset = gutter / 2;
    return {
      left: (cell.x * canvasWidth) + gutterOffset,
      top: (cell.y * canvasHeight) + gutterOffset,
      width: (cell.w * canvasWidth) - gutter,
      height: (cell.h * canvasHeight) - gutter
    };
  }, [gutter]);

  const createCollage = useCallback((layout: CollageLayout, mode: 'apply' | 'add' = 'apply') => {
    if (!fabricCanvas) return;

    // Clear existing frames if applying new layout
    if (mode === 'apply') {
      frames.forEach(frame => fabricCanvas.remove(frame.rect));
      setFrames(new Map());
      fabricCanvas.clear();
    }

    // Set canvas background
    fabricCanvas.backgroundColor = backgroundColor;

    const canvasWidth = fabricCanvas.width || 1080;
    const canvasHeight = fabricCanvas.height || 1080;
    const newFrames = new Map(frames);

    layout.cells.forEach((cell, index) => {
      const bounds = calculateFrameBounds(cell, canvasWidth, canvasHeight);
      const frameId = generateFrameId();
      
      const rect = new Rect({
        ...bounds,
        fill: 'transparent',
        stroke: '#e5e7eb',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        rx: cornerRadius,
        ry: cornerRadius,
        selectable: true,
        hasControls: false,
        hasBorders: true,
        hoverCursor: 'pointer',
        moveCursor: 'pointer',
      });

      // Add custom data to identify as collage frame
      (rect as any).data = {
        isCollageFrame: true,
        frameId: frameId,
        cellIndex: index
      };

      fabricCanvas.add(rect);
      
      newFrames.set(frameId, {
        id: frameId,
        rect: rect
      });
    });

    setFrames(newFrames);
    fabricCanvas.renderAll();
    toast.success(`${layout.name} layout ${mode === 'apply' ? 'applied' : 'added'}!`);
  }, [fabricCanvas, frames, gutter, cornerRadius, backgroundColor, calculateFrameBounds]);

  const updateGutter = useCallback((newGutter: number) => {
    setGutter(newGutter);
    
    if (!fabricCanvas || frames.size === 0) return;

    const canvasWidth = fabricCanvas.width || 1080;
    const canvasHeight = fabricCanvas.height || 1080;

    // Update frame positions based on new gutter
    frames.forEach((frame, frameId) => {
      const rect = frame.rect;
      const cellData = (rect as any).data;
      
      if (cellData && cellData.cellIndex !== undefined) {
        // Recalculate bounds with new gutter
        const gutterOffset = newGutter / 2;
        const currentCell = {
          x: (rect.left! - (gutter / 2)) / canvasWidth,
          y: (rect.top! - (gutter / 2)) / canvasHeight,
          w: (rect.width! + gutter) / canvasWidth,
          h: (rect.height! + gutter) / canvasHeight
        };
        
        const newBounds = calculateFrameBounds(currentCell, canvasWidth, canvasHeight);
        
        rect.set({
          left: newBounds.left,
          top: newBounds.top,
          width: newBounds.width,
          height: newBounds.height
        });

        // Update image if present
        if (frame.image) {
          scaleImageToFit(frame.image, rect);
        }
      }
    });

    fabricCanvas.renderAll();
  }, [fabricCanvas, frames, gutter, calculateFrameBounds]);

  const updateCornerRadius = useCallback((newRadius: number) => {
    setCornerRadius(newRadius);
    
    frames.forEach(frame => {
      frame.rect.set({ rx: newRadius, ry: newRadius });
      if (frame.image) {
        frame.image.set({ rx: newRadius, ry: newRadius });
      }
    });

    fabricCanvas?.renderAll();
  }, [fabricCanvas, frames]);

  const scaleImageToFit = (image: FabricImage, frame: Rect) => {
    const frameWidth = frame.width!;
    const frameHeight = frame.height!;
    const imageWidth = image.width!;
    const imageHeight = image.height!;

    // Calculate scale to cover the frame (crop to fit)
    const scaleX = frameWidth / imageWidth;
    const scaleY = frameHeight / imageHeight;
    const scale = Math.max(scaleX, scaleY);

    image.set({
      scaleX: scale,
      scaleY: scale,
      left: frame.left! + frameWidth / 2,
      top: frame.top! + frameHeight / 2,
      originX: 'center',
      originY: 'center',
      clipPath: frame
    });
  };

  const fillFrame = useCallback((frameId: string, file: File | string) => {
    const frame = frames.get(frameId);
    if (!frame || !fabricCanvas) return;

    const loadImage = (imageUrl: string) => {
      FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' as TCrossOrigin }, (img: any) => {
        if (!img) {
          toast.error('Failed to load image');
          return;
        }

        // Remove old image if exists
        if (frame.image) {
          fabricCanvas.remove(frame.image);
        }

        scaleImageToFit(img, frame.rect);
        
        // Add custom data
        (img as any).data = {
          isCollageImage: true,
          frameId: frameId
        };

        fabricCanvas.add(img);
        fabricCanvas.sendObjectToBack(img);
        fabricCanvas.bringObjectToFront(frame.rect);

        // Update frame data
        const updatedFrame = { ...frame, image: img, imageUrl };
        setFrames(prev => new Map(prev.set(frameId, updatedFrame)));

        fabricCanvas.renderAll();
        toast.success('Image added to frame!');
      });
    };

    if (typeof file === 'string') {
      loadImage(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        if (imageUrl) loadImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  }, [fabricCanvas, frames]);

  const replaceFrameImage = useCallback((frameId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        fillFrame(frameId, file);
      }
    };
    input.click();
  }, [fillFrame]);

  const swapFrameImages = useCallback((frameId1: string, frameId2: string) => {
    const frame1 = frames.get(frameId1);
    const frame2 = frames.get(frameId2);
    
    if (!frame1 || !frame2 || !fabricCanvas) return;

    const image1 = frame1.image;
    const image2 = frame2.image;

    if (image1 && image2) {
      // Swap the images
      scaleImageToFit(image1, frame2.rect);
      scaleImageToFit(image2, frame1.rect);

      // Update frame data
      setFrames(prev => {
        const updated = new Map(prev);
        updated.set(frameId1, { ...frame1, image: image2, imageUrl: frame2.imageUrl });
        updated.set(frameId2, { ...frame2, image: image1, imageUrl: frame1.imageUrl });
        return updated;
      });

      fabricCanvas.renderAll();
      toast.success('Images swapped!');
    }
  }, [fabricCanvas, frames]);

  const setCanvasBackground = useCallback((color: string) => {
    setBackgroundColor(color);
    if (fabricCanvas) {
      fabricCanvas.backgroundColor = color;
      fabricCanvas.renderAll();
    }
  }, [fabricCanvas]);

  const setBackgroundImage = useCallback((file: File) => {
    if (!fabricCanvas) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      if (imageUrl) {
        FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' as TCrossOrigin }, (img: any) => {
          if (img) {
            // Scale to cover canvas
            const canvasWidth = fabricCanvas.width || 1080;
            const canvasHeight = fabricCanvas.height || 1080;
            const scaleX = canvasWidth / (img.width || 1);
            const scaleY = canvasHeight / (img.height || 1);
            const scale = Math.max(scaleX, scaleY);
            
            img.set({
              scaleX: scale,
              scaleY: scale,
              left: canvasWidth / 2,
              top: canvasHeight / 2,
              originX: 'center',
              originY: 'center',
              selectable: false
            });

            fabricCanvas.backgroundImage = img;
            fabricCanvas.renderAll();
            toast.success('Background image set!');
          }
        });
      }
    };
    reader.readAsDataURL(file);
  }, [fabricCanvas]);

  return {
    frames,
    gutter,
    cornerRadius,
    backgroundColor,
    createCollage,
    updateGutter,
    updateCornerRadius,
    fillFrame,
    replaceFrameImage,
    swapFrameImages,
    setCanvasBackground,
    setBackgroundImage
  };
};