<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { DetailBoxKey, type DetailBoxContext } from '../YMDetailBox/context';
import { attachApi } from '../../../utils/attach-api';

interface Props {
	id?: string;
}

interface DetailSummaryElement extends HTMLElement {
	toggle(): void;
	on(
		type: string,
	listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

const props = withDefaults(defineProps<Props>(), { id: '' });

const root = ref<DetailSummaryElement | null>(null);
const box = inject<DetailBoxContext | null>(DetailBoxKey, null);

const toggle = (): void => {
	if (box) {
		box.toggle();
		return;
	}
	const el = root.value;
	if (!el) return;
	const parent = el.closest('.detail-box') as (HTMLElement & { toggle?: () => void }) | null;
	parent?.toggle?.();
};

const keydown = (event: KeyboardEvent & { cmdOrCtrlKey?: boolean }): void => {
	switch (event.code) {
		case 'Enter':
		case 'NumpadEnter':
			if (!event.cmdOrCtrlKey && !event.altKey) {
				toggle();
			}
			break;
	}
};

const pointerdown = (event: PointerEvent): void => {
	if (event.button === 0 && event.target === root.value) {
		toggle();
	}
};

	const on = (
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void => {
		root.value?.addEventListener(type, listener as EventListener, options);
	};

onMounted(() => {
	const el = root.value;
	if (!el) return;
	attachApi(el, { toggle, on });
	el.addEventListener('keydown', keydown as EventListener);
	el.addEventListener('pointerdown', pointerdown);
});

defineExpose({ toggle, on, root });
</script>

<template>
	<div
		ref="root"
		class="detail-summary"
		:class="$style.summary"
		:id="props.id"
	>
		<slot />
	</div>
</template>

<style module>
.summary {
	display: block;
	padding: 0 4px;
	height: 22px;
	line-height: 20px;
	text-indent: 16px;
	font-weight: bold;
	font-family: var(--ym-font-bold);
	background-color: var(--ym-color-surface-hover);
	border-bottom: 1px solid var(--ym-color-border);
	cursor: pointer;
	user-select: none;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
}

.summary:hover {
	filter: brightness(1.04);
}

:global(.detail-box[open]) > .summary::before {
	content: '';
	display: block;
	position: absolute;
	margin: 6px 3px;
	border-left: 5px solid transparent;
	border-right: 5px solid transparent;
	border-top: 8px solid var(--folder-mark-color);
}

:global(.detail-box:not([open])) > .summary::before {
	content: '';
	display: block;
	position: absolute;
	margin: 5px 4px;
	border-top: 5px solid transparent;
	border-bottom: 5px solid transparent;
	border-left: 8px solid var(--folder-mark-color);
}
</style>
