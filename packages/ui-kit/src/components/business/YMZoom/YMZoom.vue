<script setup lang="ts">
import { ref } from 'vue';
import YMWindowFrame from '../YMWindowFrame/YMWindowFrame.vue';
import YMTitleBar from '../YMTitleBar/YMTitleBar.vue';
import YMNumberBox from '../../basic/YMNumberBox/YMNumberBox.vue';

interface Props {
	modelValue?: number;
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
}>();

const frame = ref<{
	root: HTMLElement | null;
	on(type: string, listener: (event: Event) => void): void;
} | null>(null);
</script>

<template>
	<YMWindowFrame ref="frame" id="zoom" @confirm="emit('confirm')">
		<template #title>
			<YMTitleBar>
				{{ props.title }}
				<div class="close" />
			</YMTitleBar>
		</template>
		<div class="grid-box">
			<div class="text">{{ props.label }}</div>
			<YMNumberBox
				id="zoom-factor"
				v-focus
				min="0.6666"
				max="2"
				decimals="4"
				:model-value="props.modelValue"
				@update:model-value="emit('update:modelValue', $event)"
			/>
		</div>
	</YMWindowFrame>
</template>

<style module>
:global(#zoom) {
	width: 324px;
	height: 98px;
}
</style>
