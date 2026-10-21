<script setup lang="ts">
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
</script>

<template>
	<YMWindowFrame id="rename" @closed="emit('closed')" @confirm="emit('confirm')">
		<template #title>
			<YMTitleBar>
				{{ props.title }}
				<div class="close" />
			</YMTitleBar>
		</template>
		<div class="grid-box">
			<div class="text">{{ props.label }}</div>
			<YMTextBox
				id="rename-name"
				v-focus
				:model-value="props.modelValue"
				@update:model-value="emit('update:modelValue', $event)"
			/>
		</div>
	</YMWindowFrame>
</template>

<style module>
:global(#rename) {
	width: 324px;
	height: 98px;
}
</style>
