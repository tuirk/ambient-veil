
import React from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";

interface PathLineProps {
  points: THREE.Vector3[];
  color: THREE.Color;
  intensity: number;
  isRoughDate: boolean;
}

export const PathLine: React.FC<PathLineProps> = ({ 
  points, 
  color, 
  intensity,
  isRoughDate 
}) => {
  return (
    <Line
      points={points}
      color={color}
      lineWidth={0.6 + intensity * 0.08}
      transparent
      opacity={0.15}
      blending={THREE.AdditiveBlending}
      dashed={isRoughDate}
      dashSize={isRoughDate ? 0.1 : 0}
      dashOffset={isRoughDate ? 0.1 : 0}
      dashScale={isRoughDate ? 10 : 0}
    />
  );
};
