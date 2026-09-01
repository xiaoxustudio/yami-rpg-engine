<script setup lang="ts">
import { onMounted, ref } from 'vue';
import YMWindowFrame from '../YMWindowFrame/YMWindowFrame.vue';
import YMTitleBar from '../YMTitleBar/YMTitleBar.vue';
import YMNumberBox from '../../basic/YMNumberBox/YMNumberBox.vue';

interface Props {
	modelValue?: number;
	title?: string;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: 0,
	title: ''
});

const emit = defineEmits<{
	'update:modelValue': [value: number];
	confirm: [];
	closed: [];
}>();

const frame = ref<{
	root: HTMLElement | null;
} | null>(null);

onMounted(() => {
	const el = frame.value?.root;
	if (!el) return;
	el.addEventListener('confirm', () => emit('confirm'));
});
</script>

<template>
	<YMWindowFrame ref="frame" id="arrayList-number" @closed="emit('closed')">
		<template #title>
			<YMTitleBar>
				{{ props.title }}
				<div class="close" />
			</YMTitleBar>
		</template>
		<div class="grid-box">
			<YMNumberBox
				id="arrayList-number-value"
				v-focus
				min="-1000000000"
				max="1000000000"
				decimals="10"
				:model-value="props.modelValue"
				@update:model-value="emit('update:modelValue', $event)"
			/>
		</div>
	</YMWindowFrame>
</template>

<style module>
:global(#arrayList-number) {
	width: 300px;
	height: 98px;
}

:global(#arrayList-number-value) {
	position: absolute;
	left: 10px;
	top: 10px;
	width: 280px;
}
</style>
