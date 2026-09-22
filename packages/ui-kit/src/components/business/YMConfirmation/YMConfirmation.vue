<script setup lang="ts">
import { onMounted, ref } from 'vue';
import YMWindowFrame from '../YMWindowFrame/YMWindowFrame.vue';
import YMTitleBar from '../YMTitleBar/YMTitleBar.vue';

export interface ConfirmationItem {
	label?: string;
}

interface Props {
	message: string;
	items: ConfirmationItem[];
	contentStyle?: Record<string, string>;
}

const props = withDefaults(defineProps<Props>(), {
	contentStyle: () => ({})
});

const emit = defineEmits<{
	confirm: [index: number];
}>();

const buttonIndexes = [0, 1, 2];
const buttonRefs = ref<HTMLElement[]>([]);

function setButtonRef(element: unknown, index: number): void {
	if (element) {
		buttonRefs.value[index] = element as HTMLElement;
	}
}

function focusFirstButton(): void {
	const el = buttonRefs.value[0];
	if (el && typeof el.focus === 'function') {
		el.focus();
	}
}

onMounted(focusFirstButton);

defineExpose({ focusFirstButton });
</script>

<template>
	<YMWindowFrame id="confirmation" no-buttons mode="center" :style="contentStyle">
		<template #title>
			<YMTitleBar>
				<div class="close" />
			</YMTitleBar>
		</template>
		<div class="text" id="confirmation-message">{{ props.message }}</div>
		<div class="box" id="confirmation-button-frame">
			<button
				v-for="index in buttonIndexes"
				:key="index"
				:id="`confirmation-button-${index}`"
				v-show="props.items[index]"
				:ref="(element) => setButtonRef(element, index)"
				@click="emit('confirm', index)"
			>
				{{ props.items[index]?.label }}
			</button>
		</div>
	</YMWindowFrame>
</template>

<style module>
:global(#confirmation) {
	width: 304px;
	height: 98px;
}
</style>
