import type { InjectionKey } from 'vue';
import type { useFileActorPage } from '@app/composables/useFileActorPage';

type FileActorForm = ReturnType<typeof useFileActorPage>['form'];

export interface FileActorContext {
	form: FileActorForm;
	onParamInput: (value: unknown) => void;
}

export const fileActorContextKey: InjectionKey<FileActorContext> = Symbol('file-actor-context');
