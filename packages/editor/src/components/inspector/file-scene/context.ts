import type { InjectionKey } from 'vue';
import type { useFileScenePage } from '@app/composables/useFileScenePage';

type FileSceneForm = ReturnType<typeof useFileScenePage>['form'];

/** fileScene 表单拆段后，容器向 Properties 段注入的共享上下文。 */
export interface FileSceneContext {
	form: FileSceneForm;
	onParamInput: (value: unknown) => void;
}

export const fileSceneContextKey: InjectionKey<FileSceneContext> = Symbol('file-scene-context');
