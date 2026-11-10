import { reactive, watch } from 'vue';
import type { ObjectDirective } from 'vue';
import { getElementCapabilities } from '@ui-kit';
import type { YamiElement } from '@app/types/element-api';

export interface FocusRequest {
	id: string;
	mode?: string;
	token: number;
}

export const focusTarget = reactive<{ current: FocusRequest | null }>({ current: null });

let token = 0;

export function requestFocus(id: string, mode?: string): void {
	focusTarget.current = { id, mode, token: ++token };
}

const applyFocus = (el: HTMLElement, mode?: string): void => {
	setTimeout(() => {
		// 能力优先：控件在挂载时把自定义焦点登记到元素上（WeakMap），元素本身不再挂方法
		const capabilities = getElementCapabilities(el);
		if (capabilities?.getFocus) {
			capabilities.getFocus(mode);
			return;
		}
		const target = el as YamiElement;
		if (typeof target.getFocus === 'function') {
			target.getFocus(mode);
			return;
		}
		el.focus();
		if (mode === 'all' && typeof target.select === 'function') {
			target.select();
		}
	});
};

const stopWatchers = new WeakMap<HTMLElement, () => void>();

export const vFocus: ObjectDirective<HTMLElement> = {
	mounted(el) {
		const current = focusTarget.current;
		if (current && current.id === el.id) {
			applyFocus(el, current.mode);
		}
		const stop = watch(
			() => focusTarget.current,
			(target) => {
				if (target && target.id === el.id) {
					applyFocus(el, target.mode);
				}
			}
		);
		stopWatchers.set(el, stop);
	},
	unmounted(el) {
		stopWatchers.get(el)?.();
		stopWatchers.delete(el);
	}
};
