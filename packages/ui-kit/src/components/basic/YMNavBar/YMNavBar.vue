<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { parseNumberOrString } from '../../../utils/dom';
import { createPayloadEvent } from '../../../utils/payload-event';

interface Props {
	id?: string;
}

const props = withDefaults(defineProps<Props>(), { id: '' });

const root = ref<HTMLElement | null>(null);

let writeEventEnabled = false;
let selectEventEnabled = false;

const parseValue = (el: HTMLElement): unknown =>
	parseNumberOrString(el.getAttribute('value') ?? '');

const emitValueEvent = (target: HTMLElement, type: string, value: unknown): void => {
	const event = createPayloadEvent(type, {} as { value: unknown });
	event.value = value;
	target.dispatchEvent(event);
};

const read = (): unknown => {
	const element = root.value;
	if (!element) return undefined;
	const item = element.querySelector('.selected') as HTMLElement | null;
	return item ? parseValue(item) : undefined;
};

const unselect = (): void => {
	const element = root.value;
	if (!element) return;
	const item = element.querySelector('.selected');
	if (item) item.classList.remove('selected');
};

const write = (value: unknown): void => {
	const element = root.value;
	if (!element) return;
	const items = Array.from(element.children);
	if (items.length !== 0) {
		unselect();
		let target: HTMLElement | undefined;
		for (const item of items) {
			const node = item as HTMLElement;
			if (node.classList.contains('nav-item') && parseValue(node) === value) {
				target = node;
				break;
			}
		}
		if (target !== undefined) {
			target.classList.add('selected');
		}
		if (writeEventEnabled) {
			emitValueEvent(element, 'write', target ? value : undefined);
		}
	}
};

const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	const element = root.value;
	if (!element) return;
	element.addEventListener(type, listener, options);
	switch (type) {
		case 'write':
			writeEventEnabled = true;
			break;
		case 'select':
			selectEventEnabled = true;
			break;
	}
};

type NavBarHost = HTMLElement & {
	read: typeof read;
	write: typeof write;
	unselect: typeof unselect;
	on: typeof on;
};

const pointerdown = (event: PointerEvent): void => {
	const element = root.value;
	if (!element) return;
	if (event.button !== 0) return;
	const target = event.target as HTMLElement;
	if (target.classList.contains('nav-item') && !target.classList.contains('selected')) {
		const value = parseValue(target);
		write(value);
		if (selectEventEnabled) {
			emitValueEvent(element, 'select', value);
		}
	}
};

onMounted(() => {
	const element = root.value;
	if (!element) return;
	for (const child of Array.from(element.children)) {
		if (!child.classList.contains('nav-item')) {
			element.removeChild(child);
		}
	}
	(element as NavBarHost).read = read;
	(element as NavBarHost).write = write;
	(element as NavBarHost).unselect = unselect;
	(element as NavBarHost).on = on;
	element.addEventListener('pointerdown', pointerdown);
});

defineExpose({ read, write, unselect, on, root });
</script>

<template>
	<div ref="root" class="nav-bar" :class="$style.bar" :id="props.id">
		<slot />
	</div>
</template>

<style module>
:global(:where(.nav-bar)) {
	display: flex;
	position: absolute;
	align-items: center;
	width: 100%;
	height: 25px;
	line-height: 24px;
	font-family: var(--font-family-title);
	background-color: var(--nav-bar-background);
	border-bottom: var(--nav-bar-border);
	user-select: none;
}

:global(:where(.nav-item)) {
	height: 24px;
	padding: 0 10px;
	overflow: hidden;
	text-overflow: ellipsis;
	background-color: var(--nav-item-background);
	border-right: var(--nav-bar-border);
	cursor: pointer;
	white-space: nowrap;
}

:global(:where(.nav-item:hover)),
:global(:where(.nav-item.hover)) {
	background-color: var(--nav-item-background-hover);
}

:global(:where(.nav-item.selected)) {
	height: 25px;
	background-color: var(--nav-item-background-selected);
}

:global(:where(.nav-item.drag-entered)) {
	background-color: rgba(0, 255, 0, 0.25);
	z-index: 1;
}

:global(:where(.nav-icon)) {
	display: inline-block;
	margin-right: 2px;
	width: 1em;
	height: 24px;
	text-align: center;
	font-family: var(--font-family-symbol);
	pointer-events: none;
}

:global(:where(.nav-text)) {
	display: inline;
	pointer-events: none;
}

:global(:where(.text)) {
	display: inline;
}
</style>
