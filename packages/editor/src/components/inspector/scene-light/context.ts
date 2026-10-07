import type { InjectionKey } from 'vue';
import type { useSceneLightPage } from '@app/composables/useSceneLightPage';

type SceneLightForm = ReturnType<typeof useSceneLightPage>['form'];

export interface SceneLightContext {
	form: SceneLightForm;
	onParamInput: (value: unknown) => void;
}

export const sceneLightContextKey: InjectionKey<SceneLightContext> = Symbol('scene-light-context');
