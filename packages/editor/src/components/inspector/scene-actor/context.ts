import type { InjectionKey } from 'vue';
import type { useSceneActorPage } from '@app/composables/useSceneActorPage';

type SceneActorForm = ReturnType<typeof useSceneActorPage>['form'];

/** sceneActor 表单拆段后，容器向 Properties 段注入的共享上下文。 */
export interface SceneActorContext {
	form: SceneActorForm;
	onParamInput: (value: unknown) => void;
}

export const sceneActorContextKey: InjectionKey<SceneActorContext> = Symbol('scene-actor-context');
