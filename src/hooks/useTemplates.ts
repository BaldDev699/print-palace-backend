import { useState } from "react";
import { Canvas as FabricCanvas, Group, Rect, FabricObject, Image as FabricImage, filters } from "fabric";
import { toast } from "sonner";
import tshirtBasicImage from "@/assets/template-tshirt-basic.jpg";
import hoodieClassicImage from "@/assets/template-hoodie-classic.jpg";
import capBaseballImage from "@/assets/template-cap-baseball.jpg";
import tshirtVneckImage from "@/assets/template-tshirt-vneck.jpg";
import hoodieZipImage from "@/assets/template-hoodie-zip.jpg";
import tshirtLongsleeveImage from "@/assets/template-tshirt-longsleeve.jpg";
import flagTemplate from "@/assets/template-flag.jpg";
import waterBottleTemplate from "@/assets/template-water-bottle.jpg";
import keyholderTemplate from "@/assets/template-keyholder.jpg";
import wristbandTemplate from "@/assets/template-wristband.jpg";
import packagingBagTemplate from "@/assets/template-packaging-bag.jpg";
import ticketingBandTemplate from "@/assets/template-ticketing-band.jpg";
import businessCardTemplate from "@/assets/template-business-card.jpg";
import teardropBannerTemplate from "@/assets/template-teardrop-banner.jpg";

// Custom interfaces for extended properties
interface CustomFabricObject extends FabricObject {
  data?: {
    isMockup?: boolean;
    productType?: string;
    templateId?: string;
    designAreas?: Template["designAreas"];
    availableColors?: string[];
  };
  id?: string;
  name?: string;
}

interface CustomGroup extends Group {
  data?: {
    isMockup?: boolean;
    productType?: string;
    templateId?: string;
    designAreas?: Template["designAreas"];
    availableColors?: string[];
  };
  id?: string;
  name?: string;
}

// Enhanced Template type definition
export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  productType:
    | "t-shirt"
    | "hoodie"
    | "cap"
    | "tank-top"
    | "long-sleeve"
    | "general"
    | "scrubs"
    | "jumpsuit"
    | "apron"
    | "flag"
    | "water-bottle"
    | "key-holder"
    | "wristband"
    | "packaging-bag"
    | "ticketing-band"
    | "business-card"
    | "teardrop-banner";
  svgString?: string;
  designAreas: {
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    maxWidth?: number;
    maxHeight?: number;
  }[];
  availableColors: string[];
  popular?: boolean;
  tags: string[];
}

// Fallback shape-based mockup for templates without a real product photo
// (currently: scrubs, jumpsuit, apron - their thumbnail is still a
// placeholder). Kept as-is from the original implementation.
function createShapeMockup(productType: Template["productType"], defaultColor: string): FabricObject {
  const base = { fill: defaultColor, stroke: "#e5e7eb", strokeWidth: 2 };

  if (productType === "t-shirt" || productType === "long-sleeve") {
    return new Rect({ ...base, left: 100, top: 100, width: 200, height: 250, rx: 20, ry: 20 });
  } else if (productType === "hoodie") {
    return new Rect({ ...base, left: 80, top: 80, width: 240, height: 280, rx: 25, ry: 25 });
  } else if (productType === "cap") {
    return new Rect({ ...base, left: 120, top: 120, width: 160, height: 80, rx: 40, ry: 40 });
  } else if (productType === "scrubs") {
    return new Rect({ ...base, left: 90, top: 90, width: 220, height: 220, rx: 20, ry: 20 });
  } else if (productType === "jumpsuit") {
    return new Rect({ ...base, left: 100, top: 70, width: 200, height: 320, rx: 15, ry: 15 });
  } else if (productType === "apron") {
    return new Rect({ ...base, left: 110, top: 100, width: 180, height: 260, rx: 30, ry: 30 });
  } else if (productType === "flag") {
    return new Rect({ ...base, left: 80, top: 120, width: 240, height: 160, rx: 5, ry: 5 });
  } else if (productType === "water-bottle") {
    return new Rect({ ...base, left: 130, top: 80, width: 80, height: 200, rx: 40, ry: 40 });
  } else if (productType === "key-holder") {
    return new Rect({ ...base, left: 140, top: 150, width: 80, height: 60, rx: 20, ry: 20 });
  } else if (productType === "wristband") {
    return new Rect({ ...base, left: 100, top: 175, width: 160, height: 40, rx: 20, ry: 20 });
  } else if (productType === "packaging-bag") {
    return new Rect({ ...base, left: 110, top: 120, width: 160, height: 180, rx: 10, ry: 10 });
  } else if (productType === "ticketing-band") {
    return new Rect({ ...base, left: 90, top: 180, width: 200, height: 30, rx: 15, ry: 15 });
  } else if (productType === "business-card") {
    return new Rect({ ...base, left: 120, top: 155, width: 120, height: 70, rx: 5, ry: 5 });
  } else if (productType === "teardrop-banner") {
    return new Rect({ ...base, left: 110, top: 80, width: 120, height: 200, rx: 60, ry: 30 });
  }
  return new Rect({ ...base, left: 100, top: 100, width: 200, height: 200, rx: 10, ry: 10 });
}

// Enhanced sample templates with complete data structure
const sampleTemplates: Template[] = [
  {
    id: "tshirt-basic",
    name: "Basic T-Shirt",
    category: "T-Shirts",
    description: "Classic crew neck t-shirt perfect for everyday designs",
    thumbnail: tshirtBasicImage,
    productType: "t-shirt",

    designAreas: [
      {
        id: "chest",
        name: "Chest",
        x: 100,
        y: 120,
        width: 100,
        height: 80,
        maxWidth: 120,
        maxHeight: 100,
      },
    ],
    availableColors: ["#ffffff", "#000000", "#1f2937", "#3b82f6", "#ef4444", "#10b981"],
    popular: true,
    tags: ["basic", "classic", "cotton", "everyday"],
  },
  {
    id: "tshirt-vneck",
    name: "V-Neck T-Shirt",
    category: "T-Shirts",
    description: "Stylish v-neck design for a modern look",
    thumbnail: tshirtVneckImage,
    productType: "t-shirt",

    designAreas: [
      {
        id: "chest",
        name: "Chest",
        x: 100,
        y: 130,
        width: 100,
        height: 70,
        maxWidth: 110,
        maxHeight: 85,
      },
    ],
    availableColors: ["#ffffff", "#000000", "#1f2937", "#6b7280"],
    popular: false,
    tags: ["vneck", "stylish", "modern", "fitted"],
  },
  {
    id: "tshirt-longsleeve",
    name: "Long Sleeve T-Shirt",
    category: "T-Shirts",
    description: "Long sleeve comfort for cooler weather",
    thumbnail: tshirtLongsleeveImage,
    productType: "long-sleeve",

    designAreas: [
      {
        id: "chest",
        name: "Chest",
        x: 100,
        y: 120,
        width: 100,
        height: 80,
        maxWidth: 120,
        maxHeight: 100,
      },
    ],
    availableColors: ["#1e40af", "#000000", "#ffffff", "#1f2937"],
    popular: false,
    tags: ["longsleeve", "warm", "casual", "cotton"],
  },
  {
    id: "hoodie-classic",
    name: "Classic Hoodie",
    category: "Hoodies",
    description: "Comfortable pullover hoodie with front pocket",
    thumbnail: hoodieClassicImage,
    productType: "hoodie",

    designAreas: [
      {
        id: "chest",
        name: "Chest",
        x: 110,
        y: 120,
        width: 80,
        height: 70,
        maxWidth: 100,
        maxHeight: 90,
      },
    ],
    availableColors: ["#6b7280", "#000000", "#1f2937", "#ffffff", "#3b82f6"],
    popular: true,
    tags: ["hoodie", "warm", "casual", "pocket", "comfortable"],
  },
  {
    id: "hoodie-zip",
    name: "Zip-Up Hoodie",
    category: "Hoodies",
    description: "Full zip hoodie with hood and front zipper",
    thumbnail: hoodieZipImage,
    productType: "hoodie",

    designAreas: [
      {
        id: "left-chest",
        name: "Left Chest",
        x: 80,
        y: 120,
        width: 60,
        height: 70,
        maxWidth: 80,
        maxHeight: 90,
      },
      {
        id: "right-chest",
        name: "Right Chest",
        x: 160,
        y: 120,
        width: 60,
        height: 70,
        maxWidth: 80,
        maxHeight: 90,
      },
    ],
    availableColors: ["#000000", "#1f2937", "#6b7280", "#3b82f6"],
    popular: false,
    tags: ["zip", "hoodie", "jacket", "warm", "versatile"],
  },
  {
    id: "cap-baseball",
    name: "Baseball Cap",
    category: "Caps",
    description: "Classic baseball cap with curved brim",
    thumbnail: capBaseballImage,
    productType: "cap",

    designAreas: [
      {
        id: "front-panel",
        name: "Front Panel",
        x: 120,
        y: 110,
        width: 60,
        height: 30,
        maxWidth: 70,
        maxHeight: 40,
      },
    ],
    availableColors: ["#1e40af", "#000000", "#ffffff", "#ef4444", "#10b981"],
    popular: true,
    tags: ["cap", "baseball", "sport", "casual", "adjustable"],
  },
  {
    id: "scrubs-hospital",
    name: "Hospital Scrubs",
    category: "Uniforms",
    description: "Professional medical scrubs with chest pocket area",
    thumbnail: "/placeholder.svg",
    productType: "scrubs",
    designAreas: [
      {
        id: "chest",
        name: "Chest Pocket",
        x: 120,
        y: 140,
        width: 80,
        height: 60,
        maxWidth: 100,
        maxHeight: 80,
      },
    ],
    availableColors: ["#1992d3", "#2563eb", "#0f172a", "#16a34a", "#f8fafc"],
    popular: false,
    tags: ["scrubs", "medical", "professional", "uniform"],
  },
  {
    id: "jumpsuit-construction",
    name: "Construction Jumpsuit",
    category: "Workwear",
    description: "High-visibility construction workwear with chest panel",
    thumbnail: "/placeholder.svg",
    productType: "jumpsuit",
    designAreas: [
      {
        id: "chest",
        name: "Chest Panel",
        x: 110,
        y: 120,
        width: 80,
        height: 70,
        maxWidth: 100,
        maxHeight: 90,
      },
      {
        id: "back",
        name: "Back Panel",
        x: 110,
        y: 200,
        width: 80,
        height: 80,
        maxWidth: 100,
        maxHeight: 100,
      },
    ],
    availableColors: ["#f59e0b", "#fbbf24", "#0f172a", "#111827"],
    popular: false,
    tags: ["jumpsuit", "construction", "hi-viz", "workwear", "safety"],
  },
  {
    id: "apron-kitchen",
    name: "Kitchen Apron",
    category: "Aprons",
    description: "Professional kitchen apron with center design area",
    thumbnail: "/placeholder.svg",
    productType: "apron",
    designAreas: [
      {
        id: "chest",
        name: "Center Panel",
        x: 130,
        y: 150,
        width: 70,
        height: 90,
        maxWidth: 90,
        maxHeight: 110,
      },
    ],
    availableColors: ["#000000", "#ffffff", "#6b7280", "#b45309", "#ef4444"],
    popular: false,
    tags: ["apron", "kitchen", "chef", "cooking", "professional"],
  },
  {
    id: "general-blank",
    name: "Blank Canvas",
    category: "General",
    description: "Start with a completely blank canvas for unlimited creativity",
    thumbnail: "/placeholder.svg",
    productType: "general",
    designAreas: [],
    availableColors: ["#ffffff"],
    popular: false,
    tags: ["blank", "custom", "unlimited", "creative"],
  },
  {
    id: "flag-custom",
    name: "Custom Flag",
    category: "Promotional",
    description: "Custom flag for events, advertising, and branding",
    thumbnail: flagTemplate,
    productType: "flag",
    designAreas: [
      {
        id: "center",
        name: "Center Area",
        x: 80,
        y: 120,
        width: 140,
        height: 100,
        maxWidth: 160,
        maxHeight: 120,
      },
    ],
    availableColors: ["#ffffff", "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
    popular: true,
    tags: ["flag", "promotional", "outdoor", "events", "advertising"],
  },
  {
    id: "water-bottle-custom",
    name: "Water Bottle",
    category: "Drinkware",
    description: "Custom water bottle with wraparound design area",
    thumbnail: waterBottleTemplate,
    productType: "water-bottle",
    designAreas: [
      {
        id: "body",
        name: "Bottle Body",
        x: 130,
        y: 140,
        width: 80,
        height: 120,
        maxWidth: 100,
        maxHeight: 140,
      },
    ],
    availableColors: ["#ffffff", "#000000", "#3b82f6", "#ef4444", "#10b981", "#f59e0b"],
    popular: true,
    tags: ["bottle", "drinkware", "hydration", "sports", "eco-friendly"],
  },
  {
    id: "key-holder-custom",
    name: "Key Holder",
    category: "Accessories",
    description: "Custom key holder with logo area",
    thumbnail: keyholderTemplate,
    productType: "key-holder",
    designAreas: [
      {
        id: "front",
        name: "Front Face",
        x: 140,
        y: 160,
        width: 60,
        height: 40,
        maxWidth: 80,
        maxHeight: 60,
      },
    ],
    availableColors: ["#000000", "#ffffff", "#6b7280", "#3b82f6", "#ef4444", "#fbbf24"],
    popular: false,
    tags: ["keychain", "accessories", "logo", "promotional", "compact"],
  },
  {
    id: "wristband-custom",
    name: "Wristband",
    category: "Accessories",
    description: "Custom wristband for events and identification",
    thumbnail: wristbandTemplate,
    productType: "wristband",
    designAreas: [
      {
        id: "band",
        name: "Band Area",
        x: 100,
        y: 180,
        width: 100,
        height: 30,
        maxWidth: 120,
        maxHeight: 40,
      },
    ],
    availableColors: ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"],
    popular: false,
    tags: ["wristband", "events", "identification", "medical", "festivals"],
  },
  {
    id: "packaging-bag-custom",
    name: "Packaging Bag",
    category: "Packaging",
    description: "Custom packaging bag for retail and branding",
    thumbnail: packagingBagTemplate,
    productType: "packaging-bag",
    designAreas: [
      {
        id: "front",
        name: "Front Panel",
        x: 110,
        y: 130,
        width: 80,
        height: 100,
        maxWidth: 100,
        maxHeight: 120,
      },
    ],
    availableColors: ["#ffffff", "#000000", "#8b5132", "#6b7280", "#fbbf24"],
    popular: false,
    tags: ["bag", "packaging", "retail", "eco-friendly", "branded"],
  },
  {
    id: "ticketing-band-custom",
    name: "Ticketing Band",
    category: "Events",
    description: "Security ticketing band for events and venues",
    thumbnail: ticketingBandTemplate,
    productType: "ticketing-band",
    designAreas: [
      {
        id: "band",
        name: "Band Area",
        x: 90,
        y: 180,
        width: 120,
        height: 25,
        maxWidth: 140,
        maxHeight: 35,
      },
    ],
    availableColors: ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"],
    popular: false,
    tags: ["ticket", "events", "security", "festivals", "venues", "identification"],
  },
  {
    id: "business-card-custom",
    name: "Business Card",
    category: "Stationery",
    description: "Professional business card design",
    thumbnail: businessCardTemplate,
    productType: "business-card",
    designAreas: [
      {
        id: "front",
        name: "Front Side",
        x: 120,
        y: 160,
        width: 85,
        height: 50,
        maxWidth: 100,
        maxHeight: 65,
      },
    ],
    availableColors: ["#ffffff", "#000000", "#1f2937", "#3b82f6", "#fbbf24"],
    popular: true,
    tags: ["business", "professional", "networking", "corporate", "contact"],
  },
  {
    id: "teardrop-banner-custom",
    name: "Teardrop Banner",
    category: "Advertising",
    description: "Eye-catching teardrop banner for outdoor advertising",
    thumbnail: teardropBannerTemplate,
    productType: "teardrop-banner",
    designAreas: [
      {
        id: "main",
        name: "Main Area",
        x: 110,
        y: 100,
        width: 80,
        height: 140,
        maxWidth: 100,
        maxHeight: 160,
      },
    ],
    availableColors: ["#ffffff", "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
    popular: true,
    tags: ["banner", "advertising", "outdoor", "events", "promotional", "feather"],
  },
];

export const useTemplates = (
  fabricCanvas: FabricCanvas | null,
  setActiveMockupObject: (obj: CustomFabricObject | CustomGroup | null) => void,
  activeColor: string,
) => {
  const [templates] = useState<Template[]>(sampleTemplates);
  const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState(false);
  const [currentMockup, setCurrentMockup] = useState<CustomFabricObject | CustomGroup | null>(null);

  const changeMockupColor = (color: string, notify: boolean = false) => {
    if (!fabricCanvas || !currentMockup) return;

    const isImageMockup = currentMockup.type === "image";

    if (isImageMockup) {
      // Real product photos can't be recolored via `fill` - apply a tint
      // filter instead. This is an approximation (a color overlay on the
      // photo), not a true fabric-color change, but keeps the existing
      // color-picker UI working with real template images.
      const imgMockup = currentMockup as unknown as InstanceType<typeof FabricImage>;
      imgMockup.filters = [new filters.BlendColor({ color, mode: "tint", alpha: 0.6 })];
      imgMockup.applyFilters();
      fabricCanvas.renderAll();
      if (notify) toast.success("Mockup color updated!");
      return;
    }

    // Early return if color hasn't changed
    if (currentMockup.get("fill") === color) return;

    // Simple color change using Fabric.js fill property
    currentMockup.set("fill", color);
    fabricCanvas.renderAll();

    // Only show toast if notify is true
    if (notify) {
      toast.success("Mockup color updated!");
    }
  };

  const applyTemplate = async (template: Template) => {
    if (!fabricCanvas) return;

    // Clear existing mockup first
    if (currentMockup) {
      fabricCanvas.remove(currentMockup);
      setCurrentMockup(null);
      setActiveMockupObject(null);
    }

    // Clear all objects (including any existing design area guides)
    fabricCanvas.clear();
    if (fabricCanvas.backgroundColor !== "#ffffff") {
      fabricCanvas.backgroundColor = "#ffffff";
    }

    if (template.productType === "general") {
      toast.info(`Switched to ${template.name}. Canvas is blank and ready for your creativity!`);
      fabricCanvas.renderAll();
      setIsTemplateDrawerOpen(false);
      return;
    }

    const defaultColor = template.availableColors[0] || activeColor;
    const hasRealPhoto = !!template.thumbnail && template.thumbnail !== "/placeholder.svg";

    let mockupObject: FabricObject;

    if (hasRealPhoto) {
      try {
        // Load the actual product photo onto the canvas, instead of a
        // plain placeholder shape, so the design areas below are guides
        // drawn over a real garment/product image.
        const img = await FabricImage.fromURL(template.thumbnail, { crossOrigin: "anonymous" });

        const canvasWidth = fabricCanvas.getWidth();
        const canvasHeight = fabricCanvas.getHeight();
        const margin = 0.12; // ~12% breathing room on each side
        const maxWidth = Math.max(canvasWidth * (1 - margin * 2), 160);
        const maxHeight = Math.max(canvasHeight * (1 - margin * 2), 160);
        const naturalWidth = img.width || maxWidth;
        const naturalHeight = img.height || maxHeight;
        const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 2);

        img.set({
          scaleX: scale,
          scaleY: scale,
        });

        mockupObject = img;
      } catch (err) {
        console.error(`Failed to load template image for ${template.id}, using shape fallback:`, err);
        mockupObject = createShapeMockup(template.productType, defaultColor);
      }
    } else {
      mockupObject = createShapeMockup(template.productType, defaultColor);
    }

    // Add custom properties for mockup identification
    const customMockup = Object.assign(mockupObject, {
      data: {
        isMockup: true,
        productType: template.productType,
        templateId: template.id,
        designAreas: template.designAreas,
        availableColors: template.availableColors,
      },
      name: `${template.productType}_mockup`,
      id: "product_body",
      selectable: true,
      hasControls: true,
      hasBorders: true,
    }) as CustomFabricObject;

    fabricCanvas.add(customMockup);
    fabricCanvas.centerObject(customMockup);
    customMockup.setCoords();
    fabricCanvas.setActiveObject(customMockup);

    // Add design area guides (dashed outlines)
    template.designAreas.forEach((area) => {
      const designGuide = new Rect({
        left: area.x,
        top: area.y,
        width: area.width,
        height: area.height,
        fill: "transparent",
        stroke: "#94a3b8",
        strokeWidth: 1,
        strokeDashArray: [6, 6],
        selectable: false,
        evented: false,
        excludeFromExport: true,
      });

      Object.assign(designGuide, {
        name: "design_area_overlay",
        id: `design_area_${area.id}`,
      });

      fabricCanvas.add(designGuide);
    });

    fabricCanvas.renderAll();

    setCurrentMockup(customMockup);
    setActiveMockupObject(customMockup);

    toast.success(`Applied ${template.name} template! Ready for customization.`);
    setIsTemplateDrawerOpen(false);
  };

  return {
    templates,
    isTemplateDrawerOpen,
    setIsTemplateDrawerOpen,
    applyTemplate,
    currentMockup,
    changeMockupColor,
  };
};
