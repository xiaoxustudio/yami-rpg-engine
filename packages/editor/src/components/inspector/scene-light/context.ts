import type { InjectionKey } from 'vue';
import type { useSceneLightPage } from '@app/composables/useSceneLightPage';

type SceneLightForm = ReturnType<typeof useSceneLightPage>['form'];

/** sceneLight 表单拆段后，容器向 Properties 段注入的共享上下文。 */
export interface SceneLightContext {
	form: SceneLightForm;
	onParamInput: (value: unknown) => void;
}

export const sceneLightContextKey: InjectionKey<SceneLightContext> = Symbol('scene-light-context');
