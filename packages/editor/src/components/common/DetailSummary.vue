<template>
	<YMDetailSummary ref="ym" :id="props.id">
		<slot />
	</YMDetailSummary>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMDetailSummary } from '@ui-kit';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';

interface DetailSummaryElement extends HTMLElement {
	toggle(): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const ym = ref<{ root: HTMLElement | null; toggle(): void; on(type: string, listener: (event: Event) => void, options?: boolean | AddEventListenerOptions): void } | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const toggle = (): void => ym.value?.toggle();
const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

defineExpose({ toggle, on, root });

onMounted(() => {
	const el = root.value as DetailSummaryElement | null;
	if (!el) return;
	attachElementApi(el, { toggle, on });
});
</script>
