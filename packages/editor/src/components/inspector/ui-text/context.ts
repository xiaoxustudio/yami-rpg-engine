import type { InjectionKey } from 'vue';
import type { useUITextPage } from '@app/composables/useUITextPage';

type UITextForm = ReturnType<typeof useUITextPage>['form'];

export interface UITextContext {
	form: UITextForm;
	onParamInput: (value: unknown) => void;
}

export const uiTextContextKey: InjectionKey<UITextContext> = Symbol('ui-text-context');
