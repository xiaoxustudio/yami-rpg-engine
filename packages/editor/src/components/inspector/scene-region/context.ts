import type { InjectionKey } from 'vue';
import type { useSceneRegionPage } from '@app/composables/useSceneRegionPage';

type SceneRegionForm = ReturnType<typeof useSceneRegionPage>['form'];

/** sceneRegion 表单拆段后，容器向 Properties 段注入的共享上下文。 */
export interface SceneRegionContext {
	form: SceneRegionForm;
	onParamInput: (value: unknown) => void;
}

export const sceneRegionContextKey: InjectionKey<SceneRegionContext> =
	Symbol('scene-region-context');
