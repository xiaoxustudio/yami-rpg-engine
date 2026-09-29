import type { InjectionKey } from 'vue';
import type { useSceneParallaxPage } from '@app/composables/useSceneParallaxPage';

type SceneParallaxForm = ReturnType<typeof useSceneParallaxPage>['form'];

/** sceneParallax 表单拆段后，容器向各段注入的共享上下文。 */
export interface SceneParallaxContext {
	form: SceneParallaxForm;
	onParamInput: (value: unknown) => void;
}

export const sceneParallaxContextKey: InjectionKey<SceneParallaxContext> =
	Symbol('scene-parallax-context');
