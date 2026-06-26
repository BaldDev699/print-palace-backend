import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Grid, Layout, Maximize } from 'lucide-react';

export type CollageLayout = {
  id: string;
  name: string;
  cells: { x: number; y: number; w: number; h: number }[];
};

interface CollageTemplatesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLayoutSelect: (layout: CollageLayout, mode: 'apply' | 'add') => void;
}

const collageLayouts: CollageLayout[] = [
  {
    id: '2x2',
    name: '2×2 Grid',
    cells: [
      { x: 0, y: 0, w: 0.48, h: 0.48 },
      { x: 0.52, y: 0, w: 0.48, h: 0.48 },
      { x: 0, y: 0.52, w: 0.48, h: 0.48 },
      { x: 0.52, y: 0.52, w: 0.48, h: 0.48 }
    ]
  },
  {
    id: '1x3',
    name: '1×3 Vertical',
    cells: [
      { x: 0, y: 0, w: 1, h: 0.32 },
      { x: 0, y: 0.34, w: 1, h: 0.32 },
      { x: 0, y: 0.68, w: 1, h: 0.32 }
    ]
  },
  {
    id: '3x1',
    name: '3×1 Horizontal',
    cells: [
      { x: 0, y: 0, w: 0.32, h: 1 },
      { x: 0.34, y: 0, w: 0.32, h: 1 },
      { x: 0.68, y: 0, w: 0.32, h: 1 }
    ]
  },
  {
    id: '3x3',
    name: '3×3 Grid',
    cells: [
      { x: 0, y: 0, w: 0.32, h: 0.32 },
      { x: 0.34, y: 0, w: 0.32, h: 0.32 },
      { x: 0.68, y: 0, w: 0.32, h: 0.32 },
      { x: 0, y: 0.34, w: 0.32, h: 0.32 },
      { x: 0.34, y: 0.34, w: 0.32, h: 0.32 },
      { x: 0.68, y: 0.34, w: 0.32, h: 0.32 },
      { x: 0, y: 0.68, w: 0.32, h: 0.32 },
      { x: 0.34, y: 0.68, w: 0.32, h: 0.32 },
      { x: 0.68, y: 0.68, w: 0.32, h: 0.32 }
    ]
  },
  {
    id: 'large-small',
    name: 'Large + Small',
    cells: [
      { x: 0, y: 0, w: 0.65, h: 1 },
      { x: 0.68, y: 0, w: 0.32, h: 0.48 },
      { x: 0.68, y: 0.52, w: 0.32, h: 0.48 }
    ]
  },
  {
    id: 'top-bottom',
    name: 'Top + Bottom',
    cells: [
      { x: 0, y: 0, w: 1, h: 0.65 },
      { x: 0, y: 0.68, w: 0.48, h: 0.32 },
      { x: 0.52, y: 0.68, w: 0.48, h: 0.32 }
    ]
  },
  {
    id: 'magazine',
    name: 'Magazine',
    cells: [
      { x: 0, y: 0, w: 0.48, h: 0.65 },
      { x: 0.52, y: 0, w: 0.48, h: 0.32 },
      { x: 0.52, y: 0.35, w: 0.48, h: 0.32 },
      { x: 0, y: 0.68, w: 1, h: 0.32 }
    ]
  },
  {
    id: 'story',
    name: 'Story Layout',
    cells: [
      { x: 0, y: 0, w: 1, h: 0.4 },
      { x: 0, y: 0.43, w: 0.65, h: 0.25 },
      { x: 0.68, y: 0.43, w: 0.32, h: 0.25 },
      { x: 0, y: 0.71, w: 1, h: 0.29 }
    ]
  }
];

const LayoutPreview: React.FC<{ layout: CollageLayout }> = ({ layout }) => (
  <div className="w-full h-24 bg-muted rounded border-2 border-border relative overflow-hidden">
    {layout.cells.map((cell, index) => (
      <div
        key={index}
        className="absolute bg-primary/20 border border-primary/40 rounded-sm"
        style={{
          left: `${cell.x * 100}%`,
          top: `${cell.y * 100}%`,
          width: `${cell.w * 100}%`,
          height: `${cell.h * 100}%`
        }}
      />
    ))}
  </div>
);

export const CollageTemplates: React.FC<CollageTemplatesProps> = ({
  open,
  onOpenChange,
  onLayoutSelect
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Collage Templates
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[60vh] p-1">
          {collageLayouts.map((layout) => (
            <Card key={layout.id} className="p-3 hover:shadow-md transition-shadow">
              <LayoutPreview layout={layout} />
              <h4 className="text-sm font-medium mt-2 mb-3">{layout.name}</h4>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onLayoutSelect(layout, 'add')}
                  className="flex-1"
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  onClick={() => onLayoutSelect(layout, 'apply')}
                  className="flex-1"
                >
                  Apply
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};