<script setup lang="ts">
import { computed, ref } from 'vue';
import YMWindowFrame from '../YMWindowFrame/YMWindowFrame.vue';
import YMTitleBar from '../YMTitleBar/YMTitleBar.vue';
import YMTextBox from '../../basic/YMTextBox/YMTextBox.vue';

interface Props {
	id?: string;
	modelValue?: string;
	label?: string;
	title?: string;
}

const props = withDefaults(defineProps<Props>(), {
	id: 'font',
	modelValue: '',
	label: '',
	title: ''
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
	confirm: [];
}>();

const frame = ref<{
	root: HTMLElement | null;
	on(type: string, listener: (event: Event) => void): void;
} | null>(null);

defineExpose({ root: computed(() => frame.value?.root ?? null) });
</script>

<template>
	<YMWindowFrame ref="frame" :id="props.id" @confirm="emit('confirm')">
		<template #title>
			<YMTitleBar>
				{{ props.title }}
				<div class="close" />
			</YMTitleBar>
		</template>
		<div class="grid-box">
			<div class="text">{{ props.label }}</div>
			<YMTextBox
				id="font-font"
				:model-value="props.modelValue"
				@update:model-value="emit('update:modelValue', $event)"
			/>
		</div>
	</YMWindowFrame>
</template>

<style module>
:global(#font) {
	width: 324px;
	height: 98px;
}
</style>
