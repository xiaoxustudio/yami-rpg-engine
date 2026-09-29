import type { InjectionKey } from 'vue';
import type { useUIWindowPage } from '@app/composables/useUIWindowPage';

type UIWindowForm = ReturnType<typeof useUIWindowPage>['form'];

/** uiWindow 表单拆段后，容器向各段注入的共享上下文。 */
export interface UIWindowContext {
	form: UIWindowForm;
	onParamInput: (value: unknown) => void;
}

export const uiWindowContextKey: InjectionKey<UIWindowContext> = Symbol('ui-window-context');
