import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Replace } from 'lucide-react';
import { toast } from 'sonner';

export interface SuggestedDesign {
  id: string;
  name: string;
  category: 'front' | 'back' | 'pocket' | 'sleeve';
  preview: string;
  description: string;
  elements: {
    type: 'text' | 'shape' | 'pattern';
    content: string;
    position: { x: number; y: number };
    style: Record<string, any>;
  }[];
  placement: {
    zone: string;
    recommendedSize: { width: number; height: number };
  };
}

const suggestedDesigns: SuggestedDesign[] = [
  // Front Designs
  {
    id: 'front-logo-1',
    name: 'Classic Logo Placement',
    category: 'front',
    preview: '🏢',
    description: 'Professional logo on left chest area',
    elements: [
      {
        type: 'text',
        content: 'BRAND',
        position: { x: 120, y: 150 },
        style: { fontSize: 24, fontWeight: 'bold', fill: '#000000' }
      }
    ],
    placement: {
      zone: 'left-chest',
      recommendedSize: { width: 80, height: 30 }
    }
  },
  {
    id: 'front-center-1',
    name: 'Center Statement',
    category: 'front',
    preview: '✨',
    description: 'Bold center chest design',
    elements: [
      {
        type: 'text',
        content: 'CREATIVE',
        position: { x: 400, y: 250 },
        style: { fontSize: 48, fontWeight: 'bold', fill: '#000000' }
      },
      {
        type: 'text',
        content: 'STUDIO',
        position: { x: 400, y: 290 },
        style: { fontSize: 24, fill: '#666666' }
      }
    ],
    placement: {
      zone: 'center-chest',
      recommendedSize: { width: 200, height: 80 }
    }
  },
  {
    id: 'front-minimal-1',
    name: 'Minimal Text',
    category: 'front',
    preview: '📝',
    description: 'Clean, minimal typography',
    elements: [
      {
        type: 'text',
        content: 'minimal',
        position: { x: 400, y: 200 },
        style: { fontSize: 32, fontFamily: 'serif', fill: '#000000' }
      }
    ],
    placement: {
      zone: 'center-chest',
      recommendedSize: { width: 120, height: 40 }
    }
  },

  // Back Designs
  {
    id: 'back-full-1',
    name: 'Full Back Graphics',
    category: 'back',
    preview: '🎨',
    description: 'Large back design with text',
    elements: [
      {
        type: 'text',
        content: 'DESIGN',
        position: { x: 400, y: 200 },
        style: { fontSize: 64, fontWeight: 'bold', fill: '#000000' }
      },
      {
        type: 'text',
        content: 'FOR EVERYONE',
        position: { x: 400, y: 270 },
        style: { fontSize: 24, fill: '#666666' }
      }
    ],
    placement: {
      zone: 'center-back',
      recommendedSize: { width: 300, height: 120 }
    }
  },
  {
    id: 'back-spine-1',
    name: 'Spine Text',
    category: 'back',
    preview: '📖',
    description: 'Vertical text along the spine',
    elements: [
      {
        type: 'text',
        content: 'STUDIO 2024',
        position: { x: 400, y: 300 },
        style: { fontSize: 18, rotation: 90, fill: '#000000' }
      }
    ],
    placement: {
      zone: 'spine',
      recommendedSize: { width: 20, height: 100 }
    }
  },

  // Pocket Designs
  {
    id: 'pocket-badge-1',
    name: 'Pocket Badge',
    category: 'pocket',
    preview: '🏷️',
    description: 'Small badge design for pocket area',
    elements: [
      {
        type: 'shape',
        content: 'circle',
        position: { x: 150, y: 380 },
        style: { radius: 15, fill: '#000000' }
      },
      {
        type: 'text',
        content: 'DS',
        position: { x: 150, y: 380 },
        style: { fontSize: 12, fill: '#ffffff', fontWeight: 'bold' }
      }
    ],
    placement: {
      zone: 'left-pocket',
      recommendedSize: { width: 30, height: 30 }
    }
  },
  {
    id: 'pocket-logo-1',
    name: 'Pocket Logo',
    category: 'pocket',
    preview: '🔖',
    description: 'Minimal logo for pocket placement',
    elements: [
      {
        type: 'text',
        content: '⭐',
        position: { x: 150, y: 380 },
        style: { fontSize: 20, fill: '#000000' }
      }
    ],
    placement: {
      zone: 'left-pocket',
      recommendedSize: { width: 25, height: 25 }
    }
  },

  // Sleeve Designs
  {
    id: 'sleeve-patch-1',
    name: 'Arm Patch',
    category: 'sleeve',
    preview: '🎖️',
    description: 'Patch-style design for sleeve',
    elements: [
      {
        type: 'shape',
        content: 'rectangle',
        position: { x: 650, y: 280 },
        style: { width: 60, height: 40, fill: '#000000' }
      },
      {
        type: 'text',
        content: '2024',
        position: { x: 650, y: 280 },
        style: { fontSize: 14, fill: '#ffffff', fontWeight: 'bold' }
      }
    ],
    placement: {
      zone: 'right-sleeve',
      recommendedSize: { width: 60, height: 40 }
    }
  },
  {
    id: 'sleeve-minimal-1',
    name: 'Sleeve Text',
    category: 'sleeve',
    preview: '💫',
    description: 'Simple text on sleeve',
    elements: [
      {
        type: 'text',
        content: 'CREATIVE',
        position: { x: 650, y: 250 },
        style: { fontSize: 16, rotation: -15, fill: '#000000' }
      }
    ],
    placement: {
      zone: 'right-sleeve',
      recommendedSize: { width: 80, height: 20 }
    }
  }
];

interface SuggestedDesignsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDesignSelect: (design: SuggestedDesign, mode: 'add' | 'replace') => void;
}

export const SuggestedDesigns: React.FC<SuggestedDesignsProps> = ({
  open,
  onOpenChange,
  onDesignSelect
}) => {
  const handleDesignAction = (design: SuggestedDesign, mode: 'add' | 'replace') => {
    onDesignSelect(design, mode);
    toast.success(`${design.name} ${mode === 'add' ? 'added to' : 'applied to'} canvas!`);
  };

  const getDesignsByCategory = (category: string) => {
    return suggestedDesigns.filter(design => design.category === category);
  };

  const DesignCard: React.FC<{ design: SuggestedDesign }> = ({ design }) => (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="text-2xl">{design.preview}</div>
          <Badge variant="outline" className="text-xs">
            {design.placement.zone}
          </Badge>
        </div>
        <CardTitle className="text-sm">{design.name}</CardTitle>
        <CardDescription className="text-xs">{design.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDesignAction(design, 'add')}
            className="flex-1"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
          <Button
            size="sm"
            onClick={() => handleDesignAction(design, 'replace')}
            className="flex-1"
          >
            <Replace className="h-3 w-3 mr-1" />
            Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Suggested Designs</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="front" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="front">Front</TabsTrigger>
            <TabsTrigger value="back">Back</TabsTrigger>
            <TabsTrigger value="pocket">Pocket</TabsTrigger>
            <TabsTrigger value="sleeve">Sleeve</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            <TabsContent value="front" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getDesignsByCategory('front').map((design) => (
                  <DesignCard key={design.id} design={design} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="back" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getDesignsByCategory('back').map((design) => (
                  <DesignCard key={design.id} design={design} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="pocket" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getDesignsByCategory('pocket').map((design) => (
                  <DesignCard key={design.id} design={design} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="sleeve" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getDesignsByCategory('sleeve').map((design) => (
                  <DesignCard key={design.id} design={design} />
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};