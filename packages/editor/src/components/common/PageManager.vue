<template>
	<YMPageManager ref="ym" :id="props.id" @switch="onSwitch">
		<slot />
	</YMPageManager>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMPageManager } from '@ui-kit';
import { attachElementApi } from '@app/utils/attach-element-api';

interface PageManagerElement extends HTMLElement {
	switch(value: unknown): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

interface Props {
	id?: string;
}

const props = withDefaults(defineProps<Props>(), {});

const emit = defineEmits<{
	switch: [last: unknown, value: unknown];
}>();

const ym = ref<{
	root: HTMLElement | null;
	switch(value: unknown): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const switchover = (value: unknown): void => ym.value?.switch(value);

const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

/**
 * 子组件的 `switch` 现在是 **Vue emit**（`YMPageManager` 已把元素上的原生 `switch`
 * 用模板 `@switch` 收成 `emit('switch', last, value)`），所以这里是 emit → emit 的桥，
 * 不再需要 `root.value.addEventListener`。载荷是两个参数，故 handler 也收两个。
 */
const onSwitch = (last: unknown, value: unknown): void => emit('switch', last, value);

defineExpose({ switch: switchover, on, root });

onMounted(() => {
	const el = root.value as PageManagerElement | null;
	if (!el) return;
	attachElementApi(el, { switch: switchover, on });
});
</script>
