import type { InjectionKey } from 'vue';
import type { ParticleForm } from '@app/composables/useParticleLayerPage';

/** particle layer 表单拆段后，容器向各段注入的共享上下文（同一份 reactive form + 输入回调）。 */
export interface ParticleLayerContext {
	form: ParticleForm;
	onParamInput: (value: unknown) => void;
}

export const particleLayerContextKey: InjectionKey<ParticleLayerContext> =
	Symbol('particle-layer-context');
