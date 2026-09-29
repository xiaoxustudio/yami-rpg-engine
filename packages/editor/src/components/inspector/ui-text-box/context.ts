import type { InjectionKey } from 'vue';
import type { useUITextBoxPage } from '@app/composables/useUITextBoxPage';

type UITextBoxForm = ReturnType<typeof useUITextBoxPage>['form'];

/** uiTextBox 表单拆段后，容器向各段注入的共享上下文。 */
export interface UITextBoxContext {
	form: UITextBoxForm;
	onParamInput: (value: unknown) => void;
}

export const uiTextBoxContextKey: InjectionKey<UITextBoxContext> = Symbol('ui-text-box-context');
