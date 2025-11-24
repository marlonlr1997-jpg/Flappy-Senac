export interface Bird {
  y: number;
  velocity: number;
  rotation: number;
}

export interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}