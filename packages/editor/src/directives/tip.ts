import { nextTick } from 'vue';
import type { ObjectDirective } from 'vue';
import { parseLocalTip } from '@app/localize/dom-localizer';
import { setTooltip } from '@app/utils/element-utils';

/**
 * `v-tip="t('components.<键>.tip')"` —— 把 i18n 文案挂到元素的 tooltip 上。
 *
 * 存在意义（R2b）：过去 tooltip 由 `localizeDomComponents` 在启动时**逐键查 DOM** 后
 * `setTooltip(element, parseLocalTip(item.tip, item.label))` 写入；改为指令后，
 * 文案随模板 `t()` 一起声明，语言切换时 `updated` 会自动重挂（不再需要全表扫描）。
 *
 * 与本地化器的行为对齐：title（用于 `$` 前缀的 save 标签展开）取**前一个兄弟元素**的文本，
 * 即各表单里 `<div class="text">{{ t('…label') }}</div>` 那一格。
 */
const applyTip = (el: HTMLElement, value: unknown): void => {
	if (typeof value !== 'string' || value === '') return;
	const prev = el.previousElementSibling;
	const title = prev instanceof HTMLElement ? (prev.textContent ?? '').trim() : '';
	setTooltip(el, parseLocalTip(value, title));
};

export const vTip: ObjectDirective<HTMLElement, string | undefined> = {
	mounted(el, binding) {
		// 等一轮再挂：兄弟标签的 t() 文本此时才稳定
		void nextTick(() => applyTip(el, binding.value));
	},
	updated(el, binding) {
		if (binding.value !== binding.oldValue) applyTip(el, binding.value);
	}
};
