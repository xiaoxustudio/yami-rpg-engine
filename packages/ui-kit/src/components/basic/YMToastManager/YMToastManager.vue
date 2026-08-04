<script setup lang="ts">
import { ref } from 'vue';

interface ToastElement extends HTMLDivElement {
	_timer?: ReturnType<typeof setTimeout>;
}

const root = ref<HTMLElement | null>(null);

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
		(el as ToastElement)._timer = setTimeout(() => dismiss(el), duration);
	}
	return el;
};

const dismiss = (el: HTMLElement | null): void => {
	if (!el || el.parentNode !== root.value) return;
	clearTimeout((el as ToastElement)._timer);
	el.classList.remove('toast-show');
	el.classList.add('toast-hide');
	setTimeout(() => el.remove(), 200);
};

defineExpose({ show, dismiss, root });
</script>

<template>
	<div ref="root" class="toast-manager" :class="$style.manager" />
</template>

<style module>
.manager {
	position: fixed;
	right: var(--ym-space-4);
	bottom: var(--ym-space-4);
	z-index: 9999;
	display: flex;
	flex-direction: column;
	gap: var(--ym-space-2);
	pointer-events: none;
}

.manager :global(.toast) {
	pointer-events: auto;
	min-width: 200px;
	padding: var(--ym-space-2) var(--ym-space-3);
	background-color: var(--ym-color-popup-bg);
	border: 1px solid var(--ym-color-border);
	border-radius: var(--ym-radius-sm);
	color: var(--ym-color-text);
	font-family: var(--ym-font-sans);
	font-size: var(--ym-font-size-md);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	opacity: 0;
	transform: translateY(8px);
	transition:
		opacity 0.2s ease,
		transform 0.2s ease;
}

.manager :global(.toast-show) {
	opacity: 1;
	transform: none;
}

.manager :global(.toast-hide) {
	opacity: 0;
	transform: translateY(8px);
}

.manager :global(.toast-text) {
	display: inline-block;
}

.manager :global(.toast-close) {
	float: right;
	margin-left: var(--ym-space-2);
	cursor: pointer;
	opacity: 0.6;
}

.manager :global(.toast-close):hover {
	opacity: 1;
}

.manager :global(.toast-error) {
	border-color: var(--ym-color-danger);
}

.manager :global(.toast-success) {
	border-color: var(--ym-color-primary);
}
</style>
