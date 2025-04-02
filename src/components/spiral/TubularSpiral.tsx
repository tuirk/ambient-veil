
import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { generateSpiralPoints } from "@/utils/spiralUtils";

interface TubularSpiralProps {
  startYear: number;
  currentYear: number;
  zoom: number;
}

export const TubularSpiral: React.FC<TubularSpiralProps> = ({
  startYear,
  currentYear,
  zoom
}) => {
  // Generate points for the spiral path
  const spiralPoints = useMemo(() => {
    return generateSpiralPoints(
      startYear, 
      currentYear, 
      360, 
      5 * zoom, 
      1.5 * zoom
    );
  }, [startYear, currentYear, zoom]);
  
  // Create a THREE.CatmullRomCurve3 from the spiral points
  const curve = useMemo(() => {
    const positions = spiralPoints.map(point => new THREE.Vector3().copy(point.position));
    return new THREE.CatmullRomCurve3(positions, false, "centripetal", 0.5);
  }, [spiralPoints]);
  
  // Create parameters for the tube geometry - extremely subtle now
  const tubeParams = useMemo(() => ({
    tubularSegments: 500,
    radius: 0.01, // Ultra slim thickness, even thinner
    radialSegments: 6,
    closed: false
  }), []);
  
  const meshRef = useRef<THREE.Mesh>(null);

  // Add subtle animation to the tube
  useFrame(({ clock }) => {
    if (meshRef.current) {
      // TypeScript fix
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      if (material) {
        // Very subtle pulsing opacity for ethereal effect
        const time = clock.getElapsedTime();
        const pulse = Math.sin(time * 0.3) * 0.005; // Even more subtle pulse
        material.opacity = 0.04 + pulse; // Extremely translucent
      }
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <tubeGeometry args={[curve, tubeParams.tubularSegments, tubeParams.radius, tubeParams.radialSegments, tubeParams.closed]} />
      <meshBasicMaterial 
        color={new THREE.Color(0xffffff)} 
        transparent={true} 
        opacity={0.04} // Nearly invisible - just a hint
        side={THREE.DoubleSide}
        depthWrite={false} // Important for proper transparency
      />
    </mesh>
  );
};
