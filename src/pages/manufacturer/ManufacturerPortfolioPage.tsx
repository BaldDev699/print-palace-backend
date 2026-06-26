import React, { useState, useEffect } from 'react';
import { useManufacturer } from '@/hooks/useManufacturer';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, Plus, Upload, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  category?: string;
  tags?: string[];
  is_featured: boolean;
  created_at: string;
}

export const ManufacturerPortfolioPage: React.FC = () => {
  const { manufacturer, loading: manufacturerLoading } = useManufacturer();
  const { toast } = useToast();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!manufacturer) return;

      try {
        const { data, error } = await supabase
          .from('manufacturer_portfolio')
          .select('*')
          .eq('manufacturer_id', manufacturer.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPortfolioItems(data || []);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [manufacturer]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manufacturer || !selectedFile) return;

    setIsUploading(true);
    
    try {
      // Upload image
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${manufacturer.user_id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('manufacturer-portfolio')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('manufacturer-portfolio')
        .getPublicUrl(fileName);

      // Create portfolio item
      const { error: insertError } = await supabase
        .from('manufacturer_portfolio')
        .insert({
          manufacturer_id: manufacturer.id,
          title,
          description: description || null,
          category: category || null,
          tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
          image_url: publicUrl,
        });

      if (insertError) throw insertError;

      toast({
        title: 'Portfolio item added',
        description: 'Your portfolio item has been successfully added.',
      });

      // Reset form and refresh
      setTitle('');
      setDescription('');
      setCategory('');
      setTags('');
      setSelectedFile(null);
      setIsDialogOpen(false);
      window.location.reload();
    } catch (error: any) {
      console.error('Error adding portfolio item:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add portfolio item.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const deletePortfolioItem = async (item: PortfolioItem) => {
    try {
      const { error } = await supabase
        .from('manufacturer_portfolio')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      // Also delete the image
      const fileName = item.image_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('manufacturer-portfolio')
          .remove([`${manufacturer?.user_id}/${fileName}`]);
      }

      toast({
        title: 'Item deleted',
        description: 'Portfolio item has been removed.',
      });

      setPortfolioItems(prev => prev.filter(p => p.id !== item.id));
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete portfolio item.',
        variant: 'destructive',
      });
    }
  };

  if (manufacturerLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ImageIcon className="h-8 w-8" />
          Portfolio
        </h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Portfolio Item</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Image</label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-upload"
                    required
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {selectedFile ? selectedFile.name : 'Click to upload image'}
                    </p>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter portfolio item title"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this work..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., T-Shirts, Hoodies, Embroidery"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tags</label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="custom, screen printing, corporate (comma separated)"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add to Portfolio'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {portfolioItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No portfolio items yet.</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <div className="relative">
                <img 
                  src={item.image_url} 
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deletePortfolioItem(item)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                )}
                {item.category && (
                  <Badge variant="secondary" className="mb-2">
                    {item.category}
                  </Badge>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};