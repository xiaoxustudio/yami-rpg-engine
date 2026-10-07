import type { InjectionKey } from 'vue';
import type { useUIImagePage } from '@app/composables/useUIImagePage';

type UIImageForm = ReturnType<typeof useUIImagePage>['form'];

export interface UIImageContext {
	form: UIImageForm;
	onParamInput: (value: unknown) => void;
}

export const uiImageContextKey: InjectionKey<UIImageContext> = Symbol('ui-image-context');
