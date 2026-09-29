import type { InjectionKey } from 'vue';
import type { useUITextPage } from '@app/composables/useUITextPage';

type UITextForm = ReturnType<typeof useUITextPage>['form'];

/** uiText 表单拆段后，容器向各段注入的共享上下文。 */
export interface UITextContext {
	form: UITextForm;
	onParamInput: (value: unknown) => void;
}

export const uiTextContextKey: InjectionKey<UITextContext> = Symbol('ui-text-context');
