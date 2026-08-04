<template>
	<YMTitleBar ref="ym" :id="props.id">
		<slot />
	</YMTitleBar>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMTitleBar } from '@ui-kit';

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const ym = ref<{
	root: HTMLElement | null;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);

const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

defineExpose({ on, root });

onMounted(() => {
	const el = root.value as any;
	if (!el) return;
	el.on = on;
});
</script>
