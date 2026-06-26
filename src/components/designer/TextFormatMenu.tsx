
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Type } from 'lucide-react';
import { Canvas as FabricCanvas, Textbox } from 'fabric';
import { toast } from 'sonner';

interface TextFormatMenuProps {
  fabricCanvas: FabricCanvas | null;
}

export const TextFormatMenu: React.FC<TextFormatMenuProps> = ({ fabricCanvas }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState([24]);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [customFontUrl, setCustomFontUrl] = useState('');

  const predefinedFonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 
    'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
    'Trebuchet MS', 'Arial Black', 'Impact'
  ];

  const addCustomFont = () => {
    if (!customFontUrl.trim()) {
      toast.error("Please enter a valid font URL");
      return;
    }

    // Create a new font face
    const fontName = `CustomFont_${Date.now()}`;
    const fontFace = new FontFace(fontName, `url(${customFontUrl})`);
    
    fontFace.load().then((loadedFont) => {
      document.fonts.add(loadedFont);
      setFontFamily(fontName);
      toast.success("Custom font loaded successfully!");
    }).catch(() => {
      toast.error("Failed to load custom font. Please check the URL.");
    });
  };

  const addFormattedText = () => {
    if (!fabricCanvas) return;

    const textbox = new Textbox('Your Text Here', {
      left: 50,
      top: 50,
      width: 200,
      fontSize: fontSize[0],
      fontFamily: fontFamily,
      fill: '#000000',
      hasControls: true,
      hasBorders: true,
      editable: true,
    });

    fabricCanvas.add(textbox);
    fabricCanvas.setActiveObject(textbox);
    fabricCanvas.renderAll();
    setIsOpen(false);
    toast.info("Formatted text added! Double-click to edit.");
  };

  const applyToSelected = () => {
    if (!fabricCanvas) return;

    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
      const textObj = activeObject as Textbox;
      textObj.set({
        fontSize: fontSize[0],
        fontFamily: fontFamily,
      });
      fabricCanvas.renderAll();
      toast.success("Text formatting applied!");
    } else {
      toast.error("Please select a text object first");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Type className="h-4 w-4" />
          Text Format
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Text Formatting</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {predefinedFonts.map((font) => (
                  <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Custom Font URL</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://fonts.googleapis.com/..."
                value={customFontUrl}
                onChange={(e) => setCustomFontUrl(e.target.value)}
              />
              <Button onClick={addCustomFont} size="sm">Load</Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Font Size</Label>
              <span className="text-sm text-muted-foreground">{fontSize[0]}px</span>
            </div>
            <Slider
              value={fontSize}
              onValueChange={setFontSize}
              min={8}
              max={120}
              step={1}
            />
          </div>

          <div className="preview p-4 border rounded-md bg-muted/20">
            <p 
              style={{ 
                fontFamily: fontFamily, 
                fontSize: `${fontSize[0]}px`,
                margin: 0 
              }}
            >
              Preview Text
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={addFormattedText} className="flex-1">
              Add New Text
            </Button>
            <Button onClick={applyToSelected} variant="outline" className="flex-1">
              Apply to Selected
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
