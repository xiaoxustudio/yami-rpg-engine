import type { InjectionKey } from 'vue';
import type { useUITextBoxPage } from '@app/composables/useUITextBoxPage';

type UITextBoxForm = ReturnType<typeof useUITextBoxPage>['form'];

export interface UITextBoxContext {
	form: UITextBoxForm;
	onParamInput: (value: unknown) => void;
}

export const uiTextBoxContextKey: InjectionKey<UITextBoxContext> = Symbol('ui-text-box-context');
