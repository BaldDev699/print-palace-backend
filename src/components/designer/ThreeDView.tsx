import React, { useState, Suspense } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { View, Loader2 } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import ProductModel3D from "./ProductModel3D";

interface ThreeDViewProps {
  canvasData?: string;
  productType?: "t-shirt" | "hoodie" | "cap" | "general" | string;
}

const Scene3D: React.FC<{ canvasData?: string; productType?: string }> = ({
  canvasData,
  productType,
}) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 3]} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={6}
        minDistance={1.5}
        autoRotate={false}
      />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-5, -5, -5]} intensity={0.3} />

      {/* Environment for reflections */}
      <Environment preset="studio" />

      {/* Product Model */}
      <ProductModel3D productType={productType || "general"} canvasData={canvasData} />
    </>
  );
};

const LoadingFallback: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
      <p className="text-sm text-muted-foreground">Loading 3D preview...</p>
    </div>
  </div>
);

export const ThreeDView: React.FC<ThreeDViewProps> = ({ canvasData, productType }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <View className="h-4 w-4" />
          3D Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] h-[600px]">
        <DialogHeader>
          <DialogTitle>
            3D Preview -{" "}
            {productType ? productType.charAt(0).toUpperCase() + productType.slice(1) : "Item"}
          </DialogTitle>
          <DialogDescription>
            Interactive 3D preview of your design. Click and drag to rotate, scroll to zoom.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 rounded-md overflow-hidden bg-gradient-to-br from-background to-muted/20">
          <Suspense fallback={<LoadingFallback />}>
            <Canvas
              shadows
              gl={{ antialias: true, alpha: true }}
              style={{ background: "transparent" }}
            >
              <Scene3D canvasData={canvasData} productType={productType} />
            </Canvas>
          </Suspense>
        </div>
      </DialogContent>
    </Dialog>
  );
};
