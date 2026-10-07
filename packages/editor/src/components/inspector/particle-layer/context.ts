import type { InjectionKey } from 'vue';
import type { ParticleForm } from '@app/composables/useParticleLayerPage';

export interface ParticleLayerContext {
	form: ParticleForm;
	onParamInput: (value: unknown) => void;
}

export const particleLayerContextKey: InjectionKey<ParticleLayerContext> =
	Symbol('particle-layer-context');
