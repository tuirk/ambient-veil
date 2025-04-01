
import React, { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";
import { TimeEvent } from "@/types/event";
import { getEventPosition } from "@/utils/spiralUtils";

interface EventLabelProps {
  event: TimeEvent;
  startYear: number;
  zoom: number;
}

export const EventLabel: React.FC<EventLabelProps> = ({
  event,
  startYear,
  zoom
}) => {
  const { camera } = useThree();
  const position = getEventPosition(event, startYear, 5 * zoom, 1.5 * zoom);
  const [opacity, setOpacity] = useState(0);
  const billboardRef = useRef<any>(null);
  
  // Orbit animation
  useFrame(({ clock }) => {
    if (billboardRef.current) {
      // Small circular motion
      const time = clock.getElapsedTime();
      const offsetX = Math.sin(time * 0.5) * 0.15;
      const offsetZ = Math.cos(time * 0.5) * 0.15;
      
      billboardRef.current.position.x = position.x + offsetX;
      billboardRef.current.position.y = position.y + 0.4; // Fixed height above event
      billboardRef.current.position.z = position.z + offsetZ;
    }
  });
  
  // Zoom-based visibility
  useFrame(() => {
    if (camera) {
      // Calculate distance to camera
      const distance = new THREE.Vector3()
        .copy(position)
        .distanceTo(camera.position);
      
      // Show label only when zoomed in close enough
      const targetOpacity = distance < 10 ? 1 : 0;
      
      // Smooth transition for opacity
      setOpacity(THREE.MathUtils.lerp(opacity, targetOpacity, 0.05));
    }
  });
  
  return (
    <Billboard ref={billboardRef} follow={true} position={[position.x, position.y + 0.4, position.z]}>
      <Text
        color={event.color}
        fontSize={0.2}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
        fillOpacity={opacity}  // Use fillOpacity instead of opacity
        depthTest={false}
      >
        {event.title}
      </Text>
    </Billboard>
  );
};
