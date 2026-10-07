import type { InjectionKey } from 'vue';
import type { useUIWindowPage } from '@app/composables/useUIWindowPage';

type UIWindowForm = ReturnType<typeof useUIWindowPage>['form'];

export interface UIWindowContext {
	form: UIWindowForm;
	onParamInput: (value: unknown) => void;
}

export const uiWindowContextKey: InjectionKey<UIWindowContext> = Symbol('ui-window-context');
