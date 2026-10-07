import type { InjectionKey } from 'vue';
import type { useSceneAnimationPage } from '@app/composables/useSceneAnimationPage';

type SceneAnimationForm = ReturnType<typeof useSceneAnimationPage>['form'];

export interface SceneAnimationContext {
	form: SceneAnimationForm;
	onParamInput: (value: unknown) => void;
}

export const sceneAnimationContextKey: InjectionKey<SceneAnimationContext> =
	Symbol('scene-animation-context');
