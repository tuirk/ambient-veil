
import * as THREE from "three";
import { TimeEvent } from "@/types/event";

export interface ParticleData {
  particlePositions: Float32Array;
  particleSizes: Float32Array;
  particleOpacities: Float32Array;
  particleColors: Float32Array;
  bgParticlePositions: Float32Array;
  bgParticleSizes: Float32Array;
  bgParticleOpacities: Float32Array;
  bgParticleColors: Float32Array;
  tertiaryParticlePositions: Float32Array;
  tertiaryParticleSizes: Float32Array;
  tertiaryParticleColors: Float32Array;
  tertiaryParticleOpacities: Float32Array;
}

export interface ParticleGeneratorProps {
  points: THREE.Vector3[];
  particleCount: number;
  backgroundParticleCount: number;
  tertiaryParticleCount: number;
  startEvent: TimeEvent;
  isRoughDate: boolean;
  isMinimalDuration: boolean;
}

export interface ParticleLayerParams {
  baseSize: number;
  baseOpacity: number;
  spreadFactor: number;
  sizeVariation: number;
  colorVariation: number;
}
