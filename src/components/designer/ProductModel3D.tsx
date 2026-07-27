import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, PlaneGeometry, MeshStandardMaterial, CanvasTexture } from "three";
import * as THREE from "three";
import { mergeBufferGeometries } from "three-stdlib";

interface ProductModel3DProps {
  productType: string;
  canvasData?: string;
}

const ProductModel3D: React.FC<ProductModel3DProps> = ({ productType, canvasData }) => {
  const meshRef = useRef<Mesh>(null);

  // Create texture from canvas data
  const designTexture = useMemo(() => {
    if (!canvasData) return null;

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(canvasData);

    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    return texture;
  }, [canvasData]);

  // Auto-rotate the model
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  // Product-specific geometries and materials
  const { geometry, material, designPosition } = useMemo(() => {
    const baseColor = getProductColor(productType);

    switch (productType) {
      case "t-shirt":
        return {
          geometry: createTShirtGeometry(),
          material: new MeshStandardMaterial({
            color: baseColor,
            roughness: 0.8,
            metalness: 0.1,
          }),
          designPosition: [0, 0.2, 0.01] as [number, number, number],
        };

      case "hoodie":
        return {
          geometry: createHoodieGeometry(),
          material: new MeshStandardMaterial({
            color: baseColor,
            roughness: 0.9,
            metalness: 0.05,
          }),
          designPosition: [0, 0.1, 0.01] as [number, number, number],
        };

      case "cap":
        return {
          geometry: createCapGeometry(),
          material: new MeshStandardMaterial({
            color: baseColor,
            roughness: 0.7,
            metalness: 0.2,
          }),
          designPosition: [0, 0.1, 0.3] as [number, number, number],
        };

      default:
        return {
          geometry: new THREE.BoxGeometry(1, 1.2, 0.1),
          material: new MeshStandardMaterial({
            color: baseColor,
            roughness: 0.8,
            metalness: 0.1,
          }),
          designPosition: [0, 0, 0.06] as [number, number, number],
        };
    }
  }, [productType]);

  return (
    <group>
      {/* Main product mesh */}
      <mesh ref={meshRef} geometry={geometry} material={material} />

      {/* Design overlay */}
      {designTexture && (
        <mesh position={designPosition}>
          <planeGeometry args={[0.65, 0.65]} />
          <meshStandardMaterial map={designTexture} transparent opacity={1} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

// Helper functions for creating realistic product geometries
function createTShirtGeometry(): THREE.BufferGeometry {
  const group = new THREE.Group();

  // Main torso - realistic t-shirt body
  const torsoGeometry = new THREE.CylinderGeometry(0.45, 0.5, 1.2, 12);
  const torso = new THREE.Mesh(torsoGeometry);

  // Sleeves - left and right
  const sleeveGeometry = new THREE.CylinderGeometry(0.12, 0.15, 0.4, 8);
  const leftSleeve = new THREE.Mesh(sleeveGeometry);
  leftSleeve.position.set(-0.57, 0.25, 0);
  leftSleeve.rotation.z = Math.PI / 2;

  const rightSleeve = new THREE.Mesh(sleeveGeometry);
  rightSleeve.position.set(0.57, 0.25, 0);
  rightSleeve.rotation.z = -Math.PI / 2;

  // Collar area
  const collarGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.1, 12);
  const collar = new THREE.Mesh(collarGeometry);
  collar.position.set(0, 0.55, 0);

  // Combine all parts
  group.add(torso);
  group.add(leftSleeve);
  group.add(rightSleeve);
  group.add(collar);

  // Convert group to BufferGeometry
  const mergedGeometry = new THREE.BufferGeometry();
  const geometries: THREE.BufferGeometry[] = [];

  group.children.forEach((child) => {
    const mesh = child as THREE.Mesh;
    // Position/rotation set via .position.set()/.rotation.z aren't reflected
    // in mesh.matrix until a render loop updates it - these meshes are never
    // actually rendered standalone, so without this call every sub-part
    // (sleeves, hood, pocket, etc.) would merge at the origin instead of its
    // intended offset, hiding inside the main body shape.
    mesh.updateMatrix();
    const geometry = mesh.geometry.clone();
    geometry.applyMatrix4(mesh.matrix);
    geometries.push(geometry);
  });

  return mergeBufferGeometries(geometries) || new THREE.BoxGeometry(1, 1.2, 0.4);
}

function createHoodieGeometry(): THREE.BufferGeometry {
  const group = new THREE.Group();

  // Main body - slightly wider than t-shirt
  const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.55, 1.3, 12);
  const body = new THREE.Mesh(bodyGeometry);

  // Hood - semi-spherical shape
  const hoodGeometry = new THREE.SphereGeometry(0.35, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.7);
  const hood = new THREE.Mesh(hoodGeometry);
  hood.position.set(0, 0.5, -0.2);

  // Sleeves - longer and thicker than t-shirt
  const sleeveGeometry = new THREE.CylinderGeometry(0.14, 0.18, 0.6, 8);
  const leftSleeve = new THREE.Mesh(sleeveGeometry);
  leftSleeve.position.set(-0.64, 0.15, 0);
  leftSleeve.rotation.z = Math.PI / 2;

  const rightSleeve = new THREE.Mesh(sleeveGeometry);
  rightSleeve.position.set(0.64, 0.15, 0);
  rightSleeve.rotation.z = -Math.PI / 2;

  // Pocket area
  const pocketGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.05);
  const pocket = new THREE.Mesh(pocketGeometry);
  pocket.position.set(0, 0.1, 0.4);

  group.add(body);
  group.add(hood);
  group.add(leftSleeve);
  group.add(rightSleeve);
  group.add(pocket);

  // Convert to single geometry
  const geometries: THREE.BufferGeometry[] = [];
  group.children.forEach((child) => {
    const mesh = child as THREE.Mesh;
    // Position/rotation set via .position.set()/.rotation.z aren't reflected
    // in mesh.matrix until a render loop updates it - these meshes are never
    // actually rendered standalone, so without this call every sub-part
    // (sleeves, hood, pocket, etc.) would merge at the origin instead of its
    // intended offset, hiding inside the main body shape.
    mesh.updateMatrix();
    const geometry = mesh.geometry.clone();
    geometry.applyMatrix4(mesh.matrix);
    geometries.push(geometry);
  });

  return mergeBufferGeometries(geometries) || new THREE.BoxGeometry(1.1, 1.3, 0.5);
}

function createCapGeometry(): THREE.BufferGeometry {
  const group = new THREE.Group();

  // Crown - main rounded part of the cap
  const crownGeometry = new THREE.SphereGeometry(0.35, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.65);
  const crown = new THREE.Mesh(crownGeometry);
  crown.position.set(0, 0.1, 0);

  // Visor - curved bill of the cap
  const visorGeometry = new THREE.CylinderGeometry(0.4, 0.45, 0.02, 16, 1, false, 0, Math.PI);
  const visor = new THREE.Mesh(visorGeometry);
  visor.position.set(0, -0.1, 0.2);
  visor.rotation.x = -Math.PI / 6;

  // Cap band
  const bandGeometry = new THREE.CylinderGeometry(0.36, 0.36, 0.08, 16);
  const band = new THREE.Mesh(bandGeometry);
  band.position.set(0, -0.15, 0);

  group.add(crown);
  group.add(visor);
  group.add(band);

  // Convert to single geometry
  const geometries: THREE.BufferGeometry[] = [];
  group.children.forEach((child) => {
    const mesh = child as THREE.Mesh;
    // Position/rotation set via .position.set()/.rotation.z aren't reflected
    // in mesh.matrix until a render loop updates it - these meshes are never
    // actually rendered standalone, so without this call every sub-part
    // (sleeves, hood, pocket, etc.) would merge at the origin instead of its
    // intended offset, hiding inside the main body shape.
    mesh.updateMatrix();
    const geometry = mesh.geometry.clone();
    geometry.applyMatrix4(mesh.matrix);
    geometries.push(geometry);
  });

  return mergeBufferGeometries(geometries) || new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16);
}

function getProductColor(productType: string): string {
  const colors: Record<string, string> = {
    "t-shirt": "#e8e8e8",
    hoodie: "#d8d8d8",
    cap: "#c8c8c8",
    general: "#f0f0f0",
  };
  return colors[productType] || colors.general;
}

export default ProductModel3D;
