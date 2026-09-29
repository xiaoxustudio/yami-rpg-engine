import type { InjectionKey } from 'vue';
import type { useUIImagePage } from '@app/composables/useUIImagePage';

type UIImageForm = ReturnType<typeof useUIImagePage>['form'];

/** uiImage 表单拆段后，容器向各段注入的共享上下文（同一份 reactive form + 输入回调）。 */
export interface UIImageContext {
	form: UIImageForm;
	onParamInput: (value: unknown) => void;
}

export const uiImageContextKey: InjectionKey<UIImageContext> = Symbol('ui-image-context');
