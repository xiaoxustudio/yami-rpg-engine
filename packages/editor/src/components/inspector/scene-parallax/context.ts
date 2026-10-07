import type { InjectionKey } from 'vue';
import type { useSceneParallaxPage } from '@app/composables/useSceneParallaxPage';

type SceneParallaxForm = ReturnType<typeof useSceneParallaxPage>['form'];

export interface SceneParallaxContext {
	form: SceneParallaxForm;
	onParamInput: (value: unknown) => void;
}

export const sceneParallaxContextKey: InjectionKey<SceneParallaxContext> =
	Symbol('scene-parallax-context');
