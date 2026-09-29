import type { InjectionKey } from 'vue';
import type { useUIProgressBarPage } from '@app/composables/useUIProgressBarPage';

type UIProgressBarForm = ReturnType<typeof useUIProgressBarPage>['form'];

/** uiProgressBar 表单拆段后，容器向各段注入的共享上下文。 */
export interface UIProgressBarContext {
	form: UIProgressBarForm;
	onParamInput: (value: unknown) => void;
}

export const uiProgressBarContextKey: InjectionKey<UIProgressBarContext> =
	Symbol('ui-progress-bar-context');
