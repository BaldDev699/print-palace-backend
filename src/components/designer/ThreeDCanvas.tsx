import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
} from "@react-three/drei";
import { Loader2 } from "lucide-react";
import ProductModel3D from "./ProductModel3D";

interface ThreeDCanvasProps {
  canvasData?: string;
  productType?: "t-shirt" | "hoodie" | "cap" | "general" | string;
}

const Scene3D: React.FC<{
  canvasData?: string;
  productType?: string;
}> = ({ canvasData, productType }) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 3]} />

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={1.5}
        maxDistance={6}
      />

      <ambientLight intensity={0.6} />

      <directionalLight
        position={[5, 5, 5]}
        intensity={0.8}
        castShadow
      />

      <pointLight
        position={[-5, -5, -5]}
        intensity={0.3}
      />

      <Environment preset="studio" />

      <ProductModel3D
        productType={productType || "general"}
        canvasData={canvasData}
      />
    </>
  );
};

const LoadingFallback = () => (
  <div className="w-full h-full flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin" />
  </div>
);

export default function ThreeDCanvas({
  canvasData,
  productType,
}: ThreeDCanvasProps) {
  return (
    <div className="w-full h-full rounded-md overflow-hidden bg-gradient-to-br from-background to-muted/20">
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          shadows
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <Scene3D
            canvasData={canvasData}
            productType={productType}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}