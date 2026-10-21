<script setup lang="ts">
import { computed, ref } from 'vue';
import YMWindowFrame from '../YMWindowFrame/YMWindowFrame.vue';
import YMTitleBar from '../YMTitleBar/YMTitleBar.vue';
import YMNumberBox from '../../basic/YMNumberBox/YMNumberBox.vue';

interface Props {
	id?: string;
	modelValue?: number | string;
	label?: string;
	title?: string;
	min?: number | string;
	max?: number | string;
	unit?: string;
}

const props = withDefaults(defineProps<Props>(), {
	id: 'fontSize',
	modelValue: 0,
	label: '',
	title: '',
	min: 10,
	max: 400,
	unit: 'px'
});

const emit = defineEmits<{
	'update:modelValue': [value: number];
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
			<YMNumberBox
				id="fontSize-size"
				:min="props.min"
				:max="props.max"
				:unit="props.unit"
				:model-value="props.modelValue"
				@update:model-value="emit('update:modelValue', $event)"
			/>
		</div>
	</YMWindowFrame>
</template>

<style module>
:global(#fontSize) {
	width: 324px;
	height: 98px;
}
</style>
