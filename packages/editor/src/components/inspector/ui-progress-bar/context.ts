import type { InjectionKey } from 'vue';
import type { useUIProgressBarPage } from '@app/composables/useUIProgressBarPage';

type UIProgressBarForm = ReturnType<typeof useUIProgressBarPage>['form'];

export interface UIProgressBarContext {
	form: UIProgressBarForm;
	onParamInput: (value: unknown) => void;
}

export const uiProgressBarContextKey: InjectionKey<UIProgressBarContext> =
	Symbol('ui-progress-bar-context');
