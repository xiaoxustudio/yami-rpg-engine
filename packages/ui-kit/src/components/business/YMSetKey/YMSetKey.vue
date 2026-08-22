<script setup lang="ts">
import { onMounted, ref } from 'vue';
import YMWindowFrame from '../YMWindowFrame/YMWindowFrame.vue';
import YMTitleBar from '../YMTitleBar/YMTitleBar.vue';
import YMTextBox from '../../basic/YMTextBox/YMTextBox.vue';

interface Props {
	modelValue?: string;
	label?: string;
	title?: string;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: '',
	label: '',
	title: ''
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
	confirm: [];
	closed: [];
}>();

const frame = ref<{
	root: HTMLElement | null;
	on(type: string, listener: (event: Event) => void): void;
} | null>(null);

onMounted(() => {
	const el = frame.value?.root;
	if (!el) return;
	el.addEventListener('confirm', () => emit('confirm'));
});
</script>

<template>
	<YMWindowFrame ref="frame" id="setKey" @closed="emit('closed')">
		<template #title>
			<YMTitleBar>
				{{ props.title }}
				<div class="close" />
			</YMTitleBar>
		</template>
		<div class="grid-box">
			<div class="text">{{ props.label }}</div>
			<YMTextBox
				id="setKey-key"
				:model-value="props.modelValue"
				@update:model-value="emit('update:modelValue', $event)"
			/>
		</div>
	</YMWindowFrame>
</template>

<style module>
:global(#setKey) {
	width: 324px;
	height: 98px;
}
</style>
