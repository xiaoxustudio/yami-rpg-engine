import type { InjectionKey } from 'vue';
import type { useSceneParticlePage } from '@app/composables/useSceneParticlePage';

type SceneParticleForm = ReturnType<typeof useSceneParticlePage>['form'];

/** sceneParticle 表单拆段后，容器向 Properties 段注入的共享上下文。 */
export interface SceneParticleContext {
	form: SceneParticleForm;
	onParamInput: (value: unknown) => void;
}

export const sceneParticleContextKey: InjectionKey<SceneParticleContext> =
	Symbol('scene-particle-context');
