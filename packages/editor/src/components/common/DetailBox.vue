<template>
	<YMDetailBox ref="ym" :open="props.open" :id="props.id" @toggle="onToggle">
		<slot />
	</YMDetailBox>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { YMDetailBox } from '@ui-kit';

interface DetailBoxElement extends HTMLElement {
	toggle(): void;
	open(): void;
	close(): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

interface Props {
	id?: string;
	open?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	open: false
});

const emit = defineEmits<{
	toggle: [value: string];
}>();

const state = reactive({
	toggleEventEnabled: false
});

const ym = ref<{ root: HTMLElement | null; toggle(): void; open(): void; close(): void } | null>(
	null
);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const toggle = (): void => ym.value?.toggle();
const open = (): void => ym.value?.open();
const close = (): void => ym.value?.close();

const onToggle = (value: string): void => {
	emit('toggle', value);
	if (state.toggleEventEnabled) {
		const toggle = new Event('toggle');
		toggle.value = value;
		root.value?.dispatchEvent(toggle);
	}
};

const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	const el = root.value;
	if (!el) return;
	el.addEventListener(type, listener as EventListener, options);
	if (type === 'toggle') {
		state.toggleEventEnabled = true;
	}
};

defineExpose({ toggle, open, close, on, root });

onMounted(() => {
	const el = root.value as DetailBoxElement | null;
	if (!el) return;
	const define = (key: string, value: unknown): void => {
		Object.defineProperty(el, key, {
			value,
			writable: true,
			configurable: true,
			enumerable: false
		});
	};
	// note: do not expose `open` on the element because it collides with the
	// boolean `open` DOM attribute/HTML attribute and breaks Vue's patcher
	// (element would receive both attribute and property updates incorrectly).
	define('toggle', toggle);
	define('close', close);
	define('on', on);
});
</script>
