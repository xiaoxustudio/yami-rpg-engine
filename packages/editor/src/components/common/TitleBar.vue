<template>
	<YMTitleBar ref="ym" :id="props.id">
		<slot />
	</YMTitleBar>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMTitleBar } from '@ui-kit';
import { attachElementApi } from '@/utils/attach-element-api';

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const ym = ref<{
	root: HTMLElement | null;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);

const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

defineExpose({ on, root });

onMounted(() => {
	const el = root.value as HTMLElement & Record<'on', typeof on>;
	if (!el) return;
	attachElementApi(el, { on });
});
</script>
