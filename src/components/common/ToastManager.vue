<template>
	<div class="toast-manager" ref="root"></div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { on } from '@/util/element-utils.ts';

const root = ref<HTMLElement | null>(null);

const show = (
	message: string,
	type: string = 'info',
	duration: number = 4000
): HTMLDivElement => {
	const el = document.createElement('div');
	el.className = `toast toast-${type}`;
	const text = document.createElement('span');
	text.className = 'toast-text';
	text.textContent = message;
	const close = document.createElement('span');
	close.className = 'toast-close';
	close.textContent = '×';
	on(close, 'click', () => dismiss(el));
	el.appendChild(text);
	el.appendChild(close);
	root.value?.appendChild(el);
	requestAnimationFrame(() => el.classList.add('toast-show'));
	if (duration > 0) {
		(el as HTMLDivElement & { _timer: ReturnType<typeof setTimeout> })._timer = setTimeout(
			() => dismiss(el),
			duration
		);
	}
	return el;
};

const dismiss = (el: HTMLElement | null): void => {
	if (!el || el.parentNode !== root.value) return;
	clearTimeout((el as HTMLElement & { _timer: ReturnType<typeof setTimeout> })._timer);
	el.classList.remove('toast-show');
	el.classList.add('toast-hide');
	setTimeout(() => el.remove(), 200);
};

defineExpose({ show, dismiss, root });
</script>
