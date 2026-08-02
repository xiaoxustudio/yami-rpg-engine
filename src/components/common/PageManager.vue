<template>
	<div class="page-manager" ref="root" :id="props.id">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { addClass, dispatchResizeEvent, removeClass } from '@/util/element-utils.ts';

interface Props {
	id?: string;
}

const props = withDefaults(defineProps<Props>(), {});

const emit = defineEmits<{
	switch: [last: any, value: any];
}>();

const root = ref<HTMLElement | null>(null);

const state = reactive({
	index: null as any,
	active: null as HTMLElement | null,
	switchEventEnabled: false
});

const switchover = (value: any): void => {
	const element = root.value;
	if (!element) return;
	const last = state.index;
	if (last !== value) {
		let target: HTMLElement | null = null;
		if (value !== null) {
			for (const child of element.childNodes as any) {
				if (child.tagName === 'PAGE-FRAME') {
					if (child.dataValue === undefined) {
						child.dataValue = child.getAttribute('value');
					}
					if (child.dataValue === value) {
						target = child;
						break;
					}
				}
			}
		}
		const active = state.active;
		if (active !== target) {
			state.index = value;
			state.active = target;
			active && removeClass(active, 'visible');
			target && addClass(target, 'visible');
			if (state.switchEventEnabled) {
				const event: any = new Event('switch');
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
	const nodes = element.childNodes;
	if (nodes.length > 0) {
		let i = nodes.length;
		while (--i >= 0) {
			const child: any = nodes[i];
			if (child.tagName === 'PAGE-FRAME') {
				child.dataValue = child.getAttribute('value');
			} else {
				element.removeChild(child);
			}
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
