import type { InjectionKey } from 'vue';
import type { useSceneAnimationPage } from '@app/composables/useSceneAnimationPage';

type SceneAnimationForm = ReturnType<typeof useSceneAnimationPage>['form'];

/** sceneAnimation 表单拆段后，容器向 Properties 段注入的共享上下文。 */
export interface SceneAnimationContext {
	form: SceneAnimationForm;
	onParamInput: (value: unknown) => void;
}

export const sceneAnimationContextKey: InjectionKey<SceneAnimationContext> =
	Symbol('scene-animation-context');
