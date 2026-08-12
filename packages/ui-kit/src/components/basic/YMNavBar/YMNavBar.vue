<script setup lang="ts">
import { onMounted, ref } from 'vue';

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const root = ref<HTMLElement | null>(null);

let writeEventEnabled = false;
let selectEventEnabled = false;

const numberPattern = /^-?\d+(?:\.\d+)?$/;

const parseValue = (el: HTMLElement): unknown => {
	const string = el.getAttribute('value') ?? '';
	return numberPattern.test(string) ? parseFloat(string) : string;
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
			const writeEvent = new Event('write') as Event & { value: unknown };
			writeEvent.value = target ? value : undefined;
			element.dispatchEvent(writeEvent);
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
			const select = new Event('select') as Event & { value: unknown };
			select.value = value;
			element.dispatchEvent(select);
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
.bar {
	display: flex;
	align-items: center;
	gap: var(--ym-space-1);
	background-color: var(--ym-color-surface);
	border-bottom: 1px solid var(--ym-color-border);
	padding: 0 var(--ym-space-2);
	user-select: none;
}

.bar :global(:where(.nav-item)) {
	padding: var(--ym-space-1) var(--ym-space-3);
	cursor: pointer;
	border-radius: var(--ym-radius-sm);
	white-space: nowrap;
}

.bar :global(:where(.nav-item)):hover {
	background-color: var(--ym-color-surface-hover);
}

.bar :global(:where(.nav-item.selected)) {
	background-color: var(--ym-color-selected);
	color: var(--ym-color-on-primary);
}
</style>
