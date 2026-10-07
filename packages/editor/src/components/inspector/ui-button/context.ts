import type { InjectionKey } from 'vue';
import type { ButtonForm } from '@app/composables/useUIButtonPage';

export interface UIButtonContext {
	form: ButtonForm;
	onParamInput: (value: unknown) => void;
}

export const uiButtonContextKey: InjectionKey<UIButtonContext> = Symbol('ui-button-context');
