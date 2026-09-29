import type { InjectionKey } from 'vue';
import type { useFileTriggerPage } from '@app/composables/useFileTriggerPage';

type FileTriggerForm = ReturnType<typeof useFileTriggerPage>['form'];

/** fileTrigger 表单拆段后，容器向各段注入的共享上下文。 */
export interface FileTriggerContext {
	form: FileTriggerForm;
	onParamInput: (value: unknown) => void;
}

export const fileTriggerContextKey: InjectionKey<FileTriggerContext> =
	Symbol('file-trigger-context');
