
import { Circle, Rect, Canvas as FabricCanvas, Path, FabricObject } from 'fabric';

type ShapeType = 'circle' | 'rectangle';

interface Emblem {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  category: string;
}

// SVG path data for different shapes - these create vector shapes
const getEmblemPath = (emblemId: string): string => {
  const paths: Record<string, string> = {
    // Basic shapes
    'circle': 'M50,10 A40,40 0 1,1 50,90 A40,40 0 1,1 50,10 Z',
    'square': 'M10,10 L90,10 L90,90 L10,90 Z',
    'triangle': 'M50,10 L90,80 L10,80 Z',
    'diamond': 'M50,10 L80,50 L50,90 L20,50 Z',
    'hexagon': 'M50,5 L75,25 L75,55 L50,75 L25,55 L25,25 Z',
    'star': 'M50,2 L61,35 L98,35 L68,57 L79,91 L50,69 L21,91 L32,57 L2,35 L39,35 Z',
    
    // Symbols
    'heart': 'M50,85 C50,85 20,60 20,40 C20,25 30,15 45,15 C47,15 50,20 50,20 C50,20 53,15 55,15 C70,15 80,25 80,40 C80,60 50,85 50,85 Z',
    'crown': 'M10,70 L90,70 L85,40 L70,50 L60,30 L50,45 L40,30 L30,50 L15,40 Z',
    'shield': 'M50,10 C30,10 15,20 15,35 L15,60 C15,75 30,85 50,90 C70,85 85,75 85,60 L85,35 C85,20 70,10 50,10 Z',
    'badge': 'M50,5 L60,20 L80,20 L67,35 L75,55 L50,45 L25,55 L33,35 L20,20 L40,20 Z',
    'award': 'M50,5 A25,25 0 1,1 50,55 A25,25 0 1,1 50,5 M35,50 L35,90 L50,85 L65,90 L65,50',
    'target': 'M50,5 A45,45 0 1,1 50,95 A45,45 0 1,1 50,5 M50,20 A30,30 0 1,1 50,80 A30,30 0 1,1 50,20 M50,35 A15,15 0 1,1 50,65 A15,15 0 1,1 50,35',
    'trophy': 'M30,20 L70,20 L65,50 L60,60 L40,60 L35,50 Z M20,25 C15,25 15,35 20,35 L30,35 M80,25 C85,25 85,35 80,35 L70,35 M45,60 L55,60 L55,80 L45,80 Z M35,80 L65,80',
    'zap': 'M55,5 L25,45 L40,45 L35,95 L65,55 L50,55 Z',
    'flame': 'M50,90 C30,90 20,70 25,50 C30,30 40,20 45,10 C47,15 55,20 60,30 C70,20 75,30 70,45 C80,40 85,55 75,70 C70,85 50,90 50,90 Z',
    'sparkles': 'M50,10 L52,18 L60,20 L52,22 L50,30 L48,22 L40,20 L48,18 Z M20,30 L21,34 L25,35 L21,36 L20,40 L19,36 L15,35 L19,34 Z M80,60 L81,64 L85,65 L81,66 L80,70 L79,66 L75,65 L79,64 Z',
    
    // Nature
    'leaf': 'M20,80 Q20,20 50,10 Q80,20 80,80 Q50,70 20,80 Z M20,80 Q50,50 80,80',
    'sun': 'M50,20 A30,30 0 1,1 50,80 A30,30 0 1,1 50,20 M50,5 L50,15 M85,35 L75,40 M95,50 L85,50 M85,65 L75,60 M50,85 L50,95 M15,65 L25,60 M5,50 L15,50 M15,35 L25,40',
    'moon': 'M40,10 A30,30 0 1,0 40,70 A25,25 0 1,1 40,10 Z',
    'tree': 'M45,90 L55,90 L55,70 L45,70 Z M50,70 L30,40 L70,40 Z M50,50 L25,25 L75,25 Z M50,35 L20,10 L80,10 Z',
    'mountain': 'M10,80 L30,40 L50,60 L70,20 L90,80 Z M25,65 L35,50 L45,65 Z',
    
    // Arrows
    'arrow-up': 'M50,10 L75,40 L60,40 L60,80 L40,80 L40,40 L25,40 Z',
    'arrow-down': 'M50,90 L75,60 L60,60 L60,20 L40,20 L40,60 L25,60 Z',
    'arrow-left': 'M10,50 L40,25 L40,40 L80,40 L80,60 L40,60 L40,75 Z',
    'arrow-right': 'M90,50 L60,25 L60,40 L20,40 L20,60 L60,60 L60,75 Z',
    
    // Business
    'building': 'M20,90 L20,20 L80,20 L80,90 Z M30,30 L40,30 L40,40 L30,40 Z M50,30 L60,30 L60,40 L50,40 Z M70,30 L75,30 L75,40 L70,40 Z M30,50 L40,50 L40,60 L30,60 Z M50,50 L60,50 L60,60 L50,60 Z M70,50 L75,50 L75,60 L70,60 Z M30,70 L40,70 L40,80 L30,80 Z M50,70 L60,70 L60,80 L50,80 Z',
    'briefcase': 'M15,35 L85,35 L85,80 L15,80 Z M35,35 L35,25 L65,25 L65,35 M15,45 L85,45',
    'cog': 'M50,20 A30,30 0 1,1 50,80 A30,30 0 1,1 50,20 M50,35 A15,15 0 1,1 50,65 A15,15 0 1,1 50,35 M50,5 L50,15 M50,85 L50,95 M85,35 L75,40 M25,40 L15,35 M85,65 L75,60 M25,60 L15,65 M73,27 L67,33 M33,67 L27,73 M73,73 L67,67 M33,33 L27,27',
    'chart': 'M15,85 L15,15 L85,15 M25,75 L25,45 M40,75 L40,35 M55,75 L55,55 M70,75 L70,25',
    
    // Communication
    'phone': 'M30,10 L70,10 A5,5 0 0,1 75,15 L75,85 A5,5 0 0,1 70,90 L30,90 A5,5 0 0,1 25,85 L25,15 A5,5 0 0,1 30,10 Z M45,20 L55,20 M50,75 A5,5 0 1,1 50,85 A5,5 0 1,1 50,75',
    'mail': 'M10,25 L90,25 L90,75 L10,75 Z M10,25 L50,50 L90,25',
    'message': 'M10,20 L90,20 A5,5 0 0,1 95,25 L95,65 A5,5 0 0,1 90,70 L60,70 L45,85 L45,70 L15,70 A5,5 0 0,1 10,65 L10,25 A5,5 0 0,1 15,20 Z',
    'wifi': 'M50,75 A5,5 0 1,1 50,85 A5,5 0 1,1 50,75 M25,55 A35,35 0 0,1 75,55 M15,40 A50,50 0 0,1 85,40 M5,25 A65,65 0 0,1 95,25',
    
    // Transport
    'car': 'M15,55 L25,35 L75,35 L85,55 L85,75 L75,75 L75,65 L25,65 L25,75 L15,75 Z M20,50 A5,5 0 1,1 20,60 A5,5 0 1,1 20,50 M80,50 A5,5 0 1,1 80,60 A5,5 0 1,1 80,50 M30,35 L70,35',
    'plane': 'M50,20 L50,70 M30,40 L20,35 L20,45 L30,50 M70,40 L80,35 L80,45 L70,50 M40,65 L35,75 L35,80 L40,75 M60,65 L65,75 L65,80 L60,75',
    'ship': 'M15,60 L85,60 L80,70 L75,75 L25,75 L20,70 Z M25,60 L25,45 L75,45 L75,60 M35,45 L35,35 L65,35 L65,45 M45,35 L45,25 L55,25 L55,35',
    'bike': 'M25,65 A15,15 0 1,1 25,35 A15,15 0 1,1 25,65 M75,65 A15,15 0 1,1 75,35 A15,15 0 1,1 75,65 M25,50 L45,30 L55,30 L75,50 M40,50 L60,50 M55,30 L55,20',
    
    // Lifestyle
    'music': 'M35,20 L35,60 A10,10 0 1,1 25,50 A10,10 0 1,1 35,60 M35,20 L65,15 L65,55 A10,10 0 1,1 55,45 A10,10 0 1,1 65,55 L65,15',
    'camera': 'M15,35 L85,35 A5,5 0 0,1 90,40 L90,75 A5,5 0 0,1 85,80 L15,80 A5,5 0 0,1 10,75 L10,40 A5,5 0 0,1 15,35 Z M35,25 L65,25 L60,35 L40,35 Z M50,45 A10,10 0 1,1 50,65 A10,10 0 1,1 50,45',
    'gift': 'M20,45 L80,45 L80,85 L20,85 Z M30,45 L30,25 A10,10 0 0,0 50,25 A10,10 0 0,1 70,25 L70,45 M50,25 L50,85 M20,45 L80,45',
    'home': 'M50,10 L20,35 L20,85 L80,85 L80,35 Z M35,85 L35,60 L65,60 L65,85 M45,50 L55,50',
    'coffee': 'M20,35 L20,75 A5,5 0 0,0 25,80 L65,80 A5,5 0 0,0 70,75 L70,35 Z M75,40 A10,10 0 0,1 75,60 L70,55 M25,25 L25,30 M35,25 L35,30 M45,25 L45,30',
    'palette': 'M20,50 A30,30 0 1,1 80,50 A20,20 0 0,1 60,70 A10,10 0 1,1 40,70 A30,30 0 0,1 20,50 M35,40 A5,5 0 1,1 35,50 A5,5 0 1,1 35,40 M55,30 A5,5 0 1,1 55,40 A5,5 0 1,1 55,30 M70,45 A5,5 0 1,1 70,55 A5,5 0 1,1 70,45',
    
    // Default fallback - simple circle
    'default': 'M50,10 A40,40 0 1,1 50,90 A40,40 0 1,1 50,10 Z'
  };
  
  return paths[emblemId] || paths['default'];
};

export const useCanvasShapes = (fabricCanvas: FabricCanvas | null) => {
  const addShape = (shapeType: ShapeType, color: string) => {
    if (!fabricCanvas) return;

    if (shapeType === 'rectangle') {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: color,
        width: 100,
        height: 100,
        stroke: '#000000',
        strokeWidth: 1,
        hasControls: true,
        hasBorders: true,
        lockUniScaling: false,
      });
      fabricCanvas.add(rect);
      fabricCanvas.setActiveObject(rect);
    } else if (shapeType === 'circle') {
      const circle = new Circle({
        left: 150,
        top: 150,
        fill: color,
        radius: 50,
        stroke: '#000000',
        strokeWidth: 1,
        hasControls: true,
        hasBorders: true,
        lockUniScaling: false,
      });
      fabricCanvas.add(circle);
      fabricCanvas.setActiveObject(circle);
    }

    fabricCanvas.renderAll();
  };

  const addEmblem = (emblem: Emblem, color: string) => {
    if (!fabricCanvas) return;

    try {
      const pathData = getEmblemPath(emblem.id);
      
      const pathObject = new Path(pathData, {
        left: 150,
        top: 150,
        fill: color,
        stroke: '#000000',
        strokeWidth: 1,
        scaleX: 1,
        scaleY: 1,
        hasControls: true,
        hasBorders: true,
        lockUniScaling: false,
        selectable: true,
      });

      // Set a reasonable size for the emblem
      pathObject.scaleToWidth(80);
      
      fabricCanvas.add(pathObject);
      fabricCanvas.setActiveObject(pathObject);
      fabricCanvas.renderAll();
    } catch (error) {
      console.error('Error adding emblem:', error);
      // Fallback to a simple circle if emblem creation fails
      const circle = new Circle({
        left: 150,
        top: 150,
        fill: color,
        radius: 40,
        stroke: '#000000',
        strokeWidth: 1,
        hasControls: true,
        hasBorders: true,
        lockUniScaling: false,
      });
      fabricCanvas.add(circle);
      fabricCanvas.setActiveObject(circle);
      fabricCanvas.renderAll();
    }
  };

  return { addShape, addEmblem };
};
