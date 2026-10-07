import type { InjectionKey } from 'vue';
import type { useFileScenePage } from '@app/composables/useFileScenePage';

type FileSceneForm = ReturnType<typeof useFileScenePage>['form'];

export interface FileSceneContext {
	form: FileSceneForm;
	onParamInput: (value: unknown) => void;
}

export const fileSceneContextKey: InjectionKey<FileSceneContext> = Symbol('file-scene-context');
