import { defineStore } from 'pinia';
import { reactive, shallowRef } from 'vue';
import { pinia } from './pinia';
import type { RenameForm } from '@app/composables/useRenameWindow';
import type { SetKeyForm } from '@app/composables/useSetKeyWindow';
import type { ZoomForm } from '@app/composables/useZoomWindow';
import type { ImageClipForm } from '@app/composables/useImageClipWindow';
import type { SetQuantityForm } from '@app/composables/useSetQuantityWindow';
import type { ColorForm } from '@app/composables/useColorWindow';
import type { ArrayForm, ArrayNumberForm, ArrayStringForm } from '@app/composables/useArrayWindow';

/**
 * 三个「单值表单」小窗口的状态真源（分析文档 P1 #11 的第一批）。
 *
 * 它们原先各自是所在 composable 的**模块级** `reactive`（`useRenameWindow.ts:16`、
 * `useSetKeyWindow.ts:16`、`useZoomWindow.ts:18`），只被对应窗口的模板 `v-model` 与
 * 该 composable 的 `open`/`confirm` 读写 ⇒ 升进 store 后 DevTools 可见、可按 pinia 隔离。
 *
 * 表单类型仍留在各自 composable 里（`import type` 进来：类型导入不进运行时，不会给桥接加环），
 * 调用点用同名**访问器对象**承接 ⇒ `Object.assign(form, …)`、`form.name` 等写法零改动。
 */
export const useWindowFormsStore = defineStore('windowForms', () => {
	const renameForm = reactive<RenameForm>({ name: '' });
	const setKeyForm = reactive<SetKeyForm>({ key: '' });
	const zoomForm = reactive<ZoomForm>({ factor: 1 });

	const imageClipForm = reactive<ImageClipForm>({ x: 0, y: 0, width: 0, height: 0 });

	const setQuantityForm = reactive<SetQuantityForm>({ quantity: 1, max: 1 });

	const colorForm = reactive<ColorForm>({ hex: '00000000', r: 0, g: 0, b: 0, a: 0, index: null });

	const arrayForm = reactive<ArrayForm>({ values: [] });
	const arrayNumberForm = reactive<ArrayNumberForm>({ value: 0 });
	const arrayStringForm = reactive<ArrayStringForm>({ value: '' });
	const arrayChanged = shallowRef(false);
	const scriptForm = reactive<{ script: string }>({ script: '' });

	return {
		renameForm,
		setKeyForm,
		zoomForm,
		imageClipForm,
		setQuantityForm,
		colorForm,
		arrayForm,
		arrayNumberForm,
		arrayStringForm,
		arrayChanged,
		scriptForm
	};
});

export function getWindowFormsStore() {
	return useWindowFormsStore(pinia);
}
