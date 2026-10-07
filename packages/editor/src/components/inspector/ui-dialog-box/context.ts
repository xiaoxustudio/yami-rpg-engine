import type { InjectionKey } from 'vue';
import type { useUIDialogBoxPage } from '@app/composables/useUIDialogBoxPage';

type UIDialogBoxForm = ReturnType<typeof useUIDialogBoxPage>['form'];

export interface UIDialogBoxContext {
	form: UIDialogBoxForm;
	onParamInput: (value: unknown) => void;
}

export const uiDialogBoxContextKey: InjectionKey<UIDialogBoxContext> =
	Symbol('ui-dialog-box-context');
