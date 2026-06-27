import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Circle,
  Square,
  Triangle,
  Diamond,
  Hexagon,
  Star,
  Heart,
  Crown,
  Shield,
  Badge,
  Award,
  Target,
  Leaf,
  Sun,
  Moon,
  TreePine,
  Mountain,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Building,
  Briefcase,
  Cog,
  BarChart3,
  Phone,
  Mail,
  MessageCircle,
  Wifi,
  Car,
  Plane,
  Ship,
  Bike,
  Trophy,
  Zap,
  Flame,
  Sparkles,
  Music,
  Camera,
  Gift,
  Home,
  Coffee,
  Palette,
} from "lucide-react";

interface Emblem {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  category: string;
}

interface ShapeLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmblemSelect: (emblem: Emblem) => void;
}

const emblems: Emblem[] = [
  // Basic Shapes
  { id: "circle", name: "Circle", icon: Circle, category: "basic" },
  { id: "square", name: "Square", icon: Square, category: "basic" },
  { id: "triangle", name: "Triangle", icon: Triangle, category: "basic" },
  { id: "diamond", name: "Diamond", icon: Diamond, category: "basic" },
  { id: "hexagon", name: "Hexagon", icon: Hexagon, category: "basic" },
  { id: "star", name: "Star", icon: Star, category: "basic" },

  // Symbols
  { id: "heart", name: "Heart", icon: Heart, category: "symbols" },
  { id: "crown", name: "Crown", icon: Crown, category: "symbols" },
  { id: "shield", name: "Shield", icon: Shield, category: "symbols" },
  { id: "badge", name: "Badge", icon: Badge, category: "symbols" },
  { id: "award", name: "Award", icon: Award, category: "symbols" },
  { id: "target", name: "Target", icon: Target, category: "symbols" },
  { id: "trophy", name: "Trophy", icon: Trophy, category: "symbols" },
  { id: "zap", name: "Lightning", icon: Zap, category: "symbols" },
  { id: "flame", name: "Flame", icon: Flame, category: "symbols" },
  { id: "sparkles", name: "Sparkles", icon: Sparkles, category: "symbols" },

  // Nature
  { id: "leaf", name: "Leaf", icon: Leaf, category: "nature" },
  { id: "sun", name: "Sun", icon: Sun, category: "nature" },
  { id: "moon", name: "Moon", icon: Moon, category: "nature" },
  { id: "tree", name: "Tree", icon: TreePine, category: "nature" },
  { id: "mountain", name: "Mountain", icon: Mountain, category: "nature" },

  // Arrows
  { id: "arrow-up", name: "Arrow Up", icon: ArrowUp, category: "arrows" },
  { id: "arrow-down", name: "Arrow Down", icon: ArrowDown, category: "arrows" },
  { id: "arrow-left", name: "Arrow Left", icon: ArrowLeft, category: "arrows" },
  { id: "arrow-right", name: "Arrow Right", icon: ArrowRight, category: "arrows" },

  // Business
  { id: "building", name: "Building", icon: Building, category: "business" },
  { id: "briefcase", name: "Briefcase", icon: Briefcase, category: "business" },
  { id: "cog", name: "Gear", icon: Cog, category: "business" },
  { id: "chart", name: "Chart", icon: BarChart3, category: "business" },

  // Communication
  { id: "phone", name: "Phone", icon: Phone, category: "communication" },
  { id: "mail", name: "Mail", icon: Mail, category: "communication" },
  { id: "message", name: "Message", icon: MessageCircle, category: "communication" },
  { id: "wifi", name: "Wifi", icon: Wifi, category: "communication" },

  // Transport
  { id: "car", name: "Car", icon: Car, category: "transport" },
  { id: "plane", name: "Plane", icon: Plane, category: "transport" },
  { id: "ship", name: "Ship", icon: Ship, category: "transport" },
  { id: "bike", name: "Bike", icon: Bike, category: "transport" },

  // Lifestyle
  { id: "music", name: "Music", icon: Music, category: "lifestyle" },
  { id: "camera", name: "Camera", icon: Camera, category: "lifestyle" },
  { id: "gift", name: "Gift", icon: Gift, category: "lifestyle" },
  { id: "home", name: "Home", icon: Home, category: "lifestyle" },
  { id: "coffee", name: "Coffee", icon: Coffee, category: "lifestyle" },
  { id: "palette", name: "Palette", icon: Palette, category: "lifestyle" },
];

const categories = [
  { id: "basic", name: "Basic Shapes" },
  { id: "symbols", name: "Symbols" },
  { id: "nature", name: "Nature" },
  { id: "arrows", name: "Arrows" },
  { id: "business", name: "Business" },
  { id: "communication", name: "Communication" },
  { id: "transport", name: "Transport" },
  { id: "lifestyle", name: "Lifestyle" },
];

export const ShapeLibrary: React.FC<ShapeLibraryProps> = ({
  open,
  onOpenChange,
  onEmblemSelect,
}) => {
  const [activeTab, setActiveTab] = useState("basic");

  const handleEmblemClick = (emblem: Emblem) => {
    onEmblemSelect(emblem);
    onOpenChange(false);
  };

  const getEmblemsForCategory = (categoryId: string) => {
    return emblems.filter((emblem) => emblem.category === categoryId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Shape Library</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-1 h-auto p-1">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="text-xs px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-0">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 pb-8">
                  {getEmblemsForCategory(category.id).map((emblem) => (
                    <Card
                      key={emblem.id}
                      className="overflow-hidden hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                      onClick={() => handleEmblemClick(emblem)}
                    >
                      <CardContent className="p-3 flex flex-col items-center justify-center aspect-square">
                        <emblem.icon className="h-8 w-8 mb-2 text-foreground" />
                        <span className="text-xs text-center text-muted-foreground font-medium">
                          {emblem.name}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
