<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
	switch: [last: any, value: any];
}>();

const root = ref<HTMLElement | null>(null);

const state = reactive({
	index: null as any,
	active: null as HTMLElement | null,
	switchEventEnabled: false
});

const hasClass = (el: unknown, cls: string): boolean =>
	el instanceof Element && el.classList.contains(cls);

const dispatchResizeEvent = (el: HTMLElement): void => {
	el.dispatchEvent(new Event('resize'));
};

const switchover = (value: any): void => {
	const element = root.value;
	if (!element) return;
	const last = state.index;
	if (last !== value) {
		let target: HTMLElement | null = null;
		if (value !== null) {
			for (const child of Array.from(element.children)) {
				if (hasClass(child, 'page-frame')) {
					const node = child as HTMLElement & { dataValue?: any };
					if (node.dataValue === undefined) {
						node.dataValue = node.getAttribute('value');
					}
					if (node.dataValue === value) {
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
				const event = new Event('switch') as Event & { last: any; value: any };
				event.last = last;
				event.value = value;
				element.dispatchEvent(event);
			}
			active && dispatchResizeEvent(active);
			target && dispatchResizeEvent(target);
		}
	}
};

const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	const element = root.value;
	if (!element) return;
	element.addEventListener(type, listener, options);
	if (type === 'switch') {
		state.switchEventEnabled = true;
	}
};

onMounted(() => {
	const element = root.value;
	if (!element) return;
	const nodes = Array.from(element.childNodes);
	for (const child of nodes) {
		if (hasClass(child, 'page-frame')) {
			const node = child as HTMLElement & { dataValue?: any };
			node.dataValue = node.getAttribute('value');
		} else {
			element.removeChild(child);
		}
	}
	(element as any).switch = switchover;
	(element as any).on = on;
	for (const key of ['index', 'active', 'switchEventEnabled'] as const) {
		Object.defineProperty(element, key, {
			get: () => (state as any)[key],
			set: (value: any) => {
				(state as any)[key] = value;
			},
			configurable: true
		});
	}
	element.addEventListener('switch', (e: any) => emit('switch', e.last, e.value));
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

.manager :global(.page-frame) {
	position: absolute;
	inset: 0;
	display: none;
}

.manager :global(.page-frame.visible) {
	display: block;
}
</style>
