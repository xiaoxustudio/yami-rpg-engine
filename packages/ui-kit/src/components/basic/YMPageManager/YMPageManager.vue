<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { dispatchResizeEvent } from '../../../utils/dom';
import { createPayloadEvent } from '../../../utils/payload-event';

interface Props {
	id?: string;
}

const props = withDefaults(defineProps<Props>(), { id: '' });

const emit = defineEmits<{
	switch: [last: unknown, value: unknown];
}>();

const root = ref<HTMLElement | null>(null);

const state = reactive<{
	index: unknown;
	active: HTMLElement | null;
	switchEventEnabled: boolean;
}>({
	index: null,
	active: null,
	switchEventEnabled: false
});

const hasClass = (el: unknown, cls: string): boolean =>
	el instanceof Element && el.classList.contains(cls);

const switchover = (value: unknown): void => {
	const element = root.value;
	if (!element) return;
	const last = state.index;
	if (last !== value) {
		let target: HTMLElement | null = null;
		if (value !== null) {
			for (const child of Array.from(element.children)) {
				if (hasClass(child, 'page-frame')) {
					if (child.getAttribute('value') === value) {
						target = child as HTMLElement;
						break;
					}
				}
			}
		}
		const active = state.active;
		if (active !== target) {
			state.index = value;
			state.active = target;
			active?.classList.remove('visible');
			target?.classList.add('visible');
			if (state.switchEventEnabled) {
				const event = createPayloadEvent('switch', {} as { last: unknown; value: unknown });
				event.last = last;
				event.value = value;
				element.dispatchEvent(event);
			}
			if (active) dispatchResizeEvent(active);
			if (target) dispatchResizeEvent(target);
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
	if (type === 'switch') {
		state.switchEventEnabled = true;
	}
};

type PageManagerHost = HTMLElement & {
	switch: typeof switchover;
	on: typeof on;
};

onMounted(() => {
	const element = root.value;
	if (!element) return;
	const nodes = Array.from(element.childNodes);
	for (const child of nodes) {
		if (!hasClass(child, 'page-frame')) {
			element.removeChild(child);
		}
	}
	(element as PageManagerHost).switch = switchover;
	(element as PageManagerHost).on = on;
	for (const key of ['index', 'active', 'switchEventEnabled'] as const) {
		Object.defineProperty(element, key, {
			get: () => state[key],
			set: (value: unknown) => {
				state[key] = value as never;
			},
			configurable: true
		});
	}
	element.addEventListener('switch', (e: Event & { last?: unknown; value?: unknown }) =>
		emit('switch', e.last, e.value)
	);
	state.switchEventEnabled = true;
});

defineExpose({ switch: switchover, on, root });
</script>

<template>
	<div ref="root" class="page-manager" :class="$style.manager" :id="props.id">
		<slot />
	</div>
</template>

<style module>
.manager {
	display: block;
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.manager :global(:where(.page-frame)) {
	position: absolute;
	inset: 0;
	display: none;
}

.manager :global(:where(.page-frame.visible)) {
	display: block;
}
</style>
