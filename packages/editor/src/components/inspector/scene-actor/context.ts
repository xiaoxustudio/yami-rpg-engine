import type { InjectionKey } from 'vue';
import type { useSceneActorPage } from '@app/composables/useSceneActorPage';

type SceneActorForm = ReturnType<typeof useSceneActorPage>['form'];

export interface SceneActorContext {
	form: SceneActorForm;
	onParamInput: (value: unknown) => void;
}

export const sceneActorContextKey: InjectionKey<SceneActorContext> = Symbol('scene-actor-context');
