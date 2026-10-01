<script setup lang="ts">
import { ref } from 'vue';

const timerMap = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

const root = ref<HTMLElement | null>(null);

/**
 * 模板根节点上的 `role="status" aria-live="polite"` 是必需的：toast 在本函数里**动态插入**，
 * 读屏不会因为 DOM 多了一个节点就念出来 —— live region 必须落在常驻容器上，后续
 * `appendChild` 才会被宣告。选 `polite` 而非 `assertive`：不打断用户当前朗读
 * （error 也不升级为打断，换取一致性）。
 *
 * 注意别把这段说明写成模板里的 HTML 注释：模板里出现注释会让组件变成**多根**，
 * 父级传下来的 `class`/`style` 会被静默丢掉。
 */
const show = (message: string, type: string = 'info', duration: number = 4000): HTMLDivElement => {
	const el = document.createElement('div');
	el.className = `toast toast-${type}`;
	const text = document.createElement('span');
	text.className = 'toast-text';
	text.textContent = message;
	const close = document.createElement('span');
	close.className = 'toast-close';
	close.textContent = '\u00d7';
	close.addEventListener('click', () => dismiss(el));
	el.append(text, close);
	root.value?.appendChild(el);
	requestAnimationFrame(() => el.classList.add('toast-show'));
	if (duration > 0) {
		timerMap.set(
			el,
			setTimeout(() => dismiss(el), duration)
		);
	}
	return el;
};

const dismiss = (el: HTMLElement | null): void => {
	if (!el || el.parentNode !== root.value) return;
	const timer = timerMap.get(el);
	if (timer !== undefined) clearTimeout(timer);
	el.classList.remove('toast-show');
	el.classList.add('toast-hide');
	setTimeout(() => el.remove(), 200);
};

defineExpose({ show, dismiss, root });
</script>

<template>
	<div
		ref="root"
		class="toast-manager"
		:class="$style.manager"
		role="status"
		aria-live="polite"
	/>
</template>

<style module>
:global(:where(.toast-manager)) {
	position: fixed;
	right: var(--ym-space-4);
	bottom: var(--ym-space-4);
	z-index: 9999;
	display: flex;
	flex-direction: column;
	gap: var(--ym-space-2);
	pointer-events: none;
}

:global(:where(.toast-manager > .toast)) {
	pointer-events: auto;
	min-width: 200px;
	padding: var(--ym-space-2) var(--ym-space-3);
	background-color: var(--ym-color-popup-bg);
	border: 1px solid var(--ym-color-border);
	border-radius: var(--ym-radius-sm);
	color: var(--ym-color-text);
	font-family: var(--ym-font-sans);
	font-size: var(--ym-font-size-sm);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	opacity: 0;
	transform: translateY(8px);
	transition:
		opacity 0.2s ease,
		transform 0.2s ease;
}

:global(:where(.toast-manager > .toast-show)) {
	opacity: 1;
	transform: none;
}

:global(:where(.toast-manager > .toast-hide)) {
	opacity: 0;
	transform: translateY(8px);
}

:global(:where(.toast-manager > .toast-text)) {
	display: inline-block;
}

:global(:where(.toast-manager > .toast-close)) {
	float: right;
	margin-left: var(--ym-space-2);
	cursor: pointer;
	opacity: 0.6;
}

:global(:where(.toast-manager > .toast-close:hover)) {
	opacity: 1;
}

:global(:where(.toast-manager > .toast-error)) {
	border-color: var(--ym-color-danger);
}

:global(:where(.toast-manager > .toast-success)) {
	border-color: var(--ym-color-primary);
}
</style>
