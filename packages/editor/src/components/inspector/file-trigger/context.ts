import type { InjectionKey } from 'vue';
import type { useFileTriggerPage } from '@app/composables/useFileTriggerPage';

type FileTriggerForm = ReturnType<typeof useFileTriggerPage>['form'];

export interface FileTriggerContext {
	form: FileTriggerForm;
	onParamInput: (value: unknown) => void;
}

export const fileTriggerContextKey: InjectionKey<FileTriggerContext> =
	Symbol('file-trigger-context');
