import type { InjectionKey } from 'vue';
import type { useUIDialogBoxPage } from '@app/composables/useUIDialogBoxPage';

type UIDialogBoxForm = ReturnType<typeof useUIDialogBoxPage>['form'];

/** uiDialogBox 表单拆段后，容器向各段注入的共享上下文。 */
export interface UIDialogBoxContext {
	form: UIDialogBoxForm;
	onParamInput: (value: unknown) => void;
}

export const uiDialogBoxContextKey: InjectionKey<UIDialogBoxContext> =
	Symbol('ui-dialog-box-context');
