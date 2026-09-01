import { reactive, watch } from 'vue';
import type { ObjectDirective } from 'vue';

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
		if (typeof el.getFocus === 'function') {
			el.getFocus(mode);
			return;
		}
		el.focus();
		if (mode === 'all' && typeof el.select === 'function') {
			el.select();
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
