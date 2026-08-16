import { Particle } from './particle-window.ts';
import { ParticleEngine, type ParticleElementLayer } from '@app/engine/particle/particle-engine.ts';

Particle.Element = ParticleEngine.Element;

export type { ParticleElementLayer };
