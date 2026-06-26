
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Template } from '@/hooks/useTemplates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Palette, Tag } from 'lucide-react';

interface TemplatesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: Template[];
  onTemplateSelect: (template: Template) => void;
}

export const Templates: React.FC<TemplatesProps> = ({ 
  open, 
  onOpenChange, 
  templates, 
  onTemplateSelect 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleTemplateClick = (template: Template) => {
    onTemplateSelect(template);
    onOpenChange(false);
  };

  // Group templates by category
  const categories = Array.from(new Set(templates.map(t => t.category)));
  const popularTemplates = templates.filter(t => t.popular);
  
  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : selectedCategory === 'popular'
    ? popularTemplates
    : templates.filter(t => t.category === selectedCategory);

  const TemplateCard = ({ template }: { template: Template }) => (
    <div 
      key={template.id} 
      className="group cursor-pointer relative"
      onClick={() => handleTemplateClick(template)}
      title={template.name}
    >
      <div className="w-24 h-24 relative overflow-hidden bg-muted rounded-md border border-border hover:border-primary/50 transition-colors">
        <img 
          src={template.thumbnail} 
          alt={template.name}
          className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
        />
        {template.popular && (
          <Badge className="absolute -top-1 -right-1 bg-yellow-500 text-yellow-900 hover:bg-yellow-500 z-20 text-xs px-1 py-0 scale-75">
            <Star className="w-2 h-2" />
          </Badge>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <span className="text-white text-xs font-medium">Use</span>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[85vh] flex flex-col z-50 bg-background">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-xl text-center flex items-center justify-center gap-2">
            <Palette className="w-5 h-5" />
            Choose Template
          </DialogTitle>
          <DialogDescription className="sr-only">
            Select a template to start designing your custom product
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
          <TabsList className="flex w-full mx-3 mb-3 overflow-x-auto bg-muted">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="flex-1 px-3 relative z-0">
            <TabsContent value={selectedCategory} className="mt-0 relative">
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-1 pb-4 relative z-0">
                {filteredTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
              
              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No templates found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Try selecting a different category or check back later for new templates.
                  </p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
