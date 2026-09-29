import type { InjectionKey } from 'vue';
import type { ButtonForm } from '@app/composables/useUIButtonPage';

/** uiButton 表单拆段后，容器向各段注入的共享上下文（同一份 reactive form + 输入回调）。 */
export interface UIButtonContext {
	form: ButtonForm;
	onParamInput: (value: unknown) => void;
}

export const uiButtonContextKey: InjectionKey<UIButtonContext> = Symbol('ui-button-context');
