import type { InjectionKey } from 'vue';
import type { useSceneRegionPage } from '@app/composables/useSceneRegionPage';

type SceneRegionForm = ReturnType<typeof useSceneRegionPage>['form'];

export interface SceneRegionContext {
	form: SceneRegionForm;
	onParamInput: (value: unknown) => void;
}

export const sceneRegionContextKey: InjectionKey<SceneRegionContext> =
	Symbol('scene-region-context');
