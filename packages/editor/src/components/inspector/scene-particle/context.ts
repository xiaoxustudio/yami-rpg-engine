import type { InjectionKey } from 'vue';
import type { useSceneParticlePage } from '@app/composables/useSceneParticlePage';

type SceneParticleForm = ReturnType<typeof useSceneParticlePage>['form'];

export interface SceneParticleContext {
	form: SceneParticleForm;
	onParamInput: (value: unknown) => void;
}

export const sceneParticleContextKey: InjectionKey<SceneParticleContext> =
	Symbol('scene-particle-context');
