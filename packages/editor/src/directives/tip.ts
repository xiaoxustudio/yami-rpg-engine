import { nextTick } from 'vue';
import type { ObjectDirective } from 'vue';
import { parseLocalTip } from '@app/localize/dom-localizer';
import { setTooltip } from '@app/utils/element-utils';

const applyTip = (el: HTMLElement, value: unknown): void => {
	if (typeof value !== 'string' || value === '') return;
	const prev = el.previousElementSibling;
	const title = prev instanceof HTMLElement ? (prev.textContent ?? '').trim() : '';
	setTooltip(el, parseLocalTip(value, title));
};

export const vTip: ObjectDirective<HTMLElement, string | undefined> = {
	mounted(el, binding) {
		void nextTick(() => applyTip(el, binding.value));
	},
	updated(el, binding) {
		if (binding.value !== binding.oldValue) applyTip(el, binding.value);
	}
};
