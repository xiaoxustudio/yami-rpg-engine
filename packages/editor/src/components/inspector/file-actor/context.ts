import type { InjectionKey } from 'vue';
import type { useFileActorPage } from '@app/composables/useFileActorPage';

type FileActorForm = ReturnType<typeof useFileActorPage>['form'];

/** fileActor 表单拆段后，容器向 Properties 段注入的共享上下文。 */
export interface FileActorContext {
	form: FileActorForm;
	onParamInput: (value: unknown) => void;
}

export const fileActorContextKey: InjectionKey<FileActorContext> = Symbol('file-actor-context');
