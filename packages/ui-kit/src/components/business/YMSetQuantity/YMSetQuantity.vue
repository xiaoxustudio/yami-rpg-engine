<script setup lang="ts">
import { ref } from 'vue';
import YMWindowFrame from '../YMWindowFrame/YMWindowFrame.vue';
import YMTitleBar from '../YMTitleBar/YMTitleBar.vue';
import YMNumberBox from '../../basic/YMNumberBox/YMNumberBox.vue';

interface Props {
	modelValue?: number;
	max: number;
	label?: string;
	title?: string;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: 1,
	label: '',
	title: ''
});

const emit = defineEmits<{
	'update:modelValue': [value: number];
	confirm: [];
	closed: [];
}>();

const frame = ref<{
	root: HTMLElement | null;
	on(type: string, listener: (event: Event) => void): void;
} | null>(null);
</script>

<template>
	<YMWindowFrame ref="frame" id="setQuantity" @closed="emit('closed')" @confirm="emit('confirm')">
		<template #title>
			<YMTitleBar>
				{{ props.title }}
				<div class="close" />
			</YMTitleBar>
		</template>
		<div class="grid-box">
			<div class="text">{{ props.label }}</div>
			<YMNumberBox
				id="setQuantity-quantity"
				v-focus
				min="1"
				:max="props.max"
				:model-value="props.modelValue"
				@update:model-value="emit('update:modelValue', $event)"
			/>
		</div>
	</YMWindowFrame>
</template>

<style module>
:global(#setQuantity) {
	width: 324px;
	height: 98px;
}
</style>
