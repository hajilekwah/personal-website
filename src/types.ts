export type AccentTheme = 'indigo' | 'emerald' | 'crimson' | 'amber' | 'cyan';

export interface ParticleConfig {
  particleCount: number;
  connectionDistance: number;
  speed: number;
  interactiveGlow: boolean;
}

export interface DeploymentStep {
  id: string;
  title: string;
  description: string;
}
