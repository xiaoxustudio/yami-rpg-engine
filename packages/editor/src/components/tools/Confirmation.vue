<template>
	<YMConfirmation
		ref="ym"
		:message="store.message"
		:items="store.items"
		:content-style="contentStyle"
		@confirm="store.confirmButton($event)"
	/>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { YMConfirmation } from '@ui-kit';
import { useConfirmationStore } from '@app/stores/confirmation';
import { measureText } from '@app/utils/dom';

const store = useConfirmationStore();

const ym = ref<{ focusFirstButton(): void } | null>(null);

const contentStyle = computed(() => {
	const measure = measureText(store.message);
	const textWidth = measure.width;
	const textHeight = measure.lines * 20;
	const buttonWidth = store.items.length * 98 - 10;
	const contentWidth = Math.max(textWidth, buttonWidth) + 20;
	const contentHeight = textHeight + 50;
	return {
		width: `${contentWidth}px`,
		height: `${contentHeight + 24}px`
	};
});

watch(
	() => store.open,
	(open) => {
		if (open && store.items.length > 0) {
			ym.value?.focusFirstButton();
		}
	}
);
</script>
