<script setup lang="ts">
import YMWindowFrame from '../YMWindowFrame/YMWindowFrame.vue';
import YMTitleBar from '../YMTitleBar/YMTitleBar.vue';
import YMTextArea from '../../basic/YMTextArea/YMTextArea.vue';

interface Props {
	modelValue?: string;
	title?: string;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: '',
	title: ''
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
	confirm: [];
	closed: [];
}>();
</script>

<template>
	<YMWindowFrame id="arrayList-string" @closed="emit('closed')" @confirm="emit('confirm')">
		<template #title>
			<YMTitleBar>
				{{ props.title }}
				<div class="close" />
			</YMTitleBar>
		</template>
		<div class="grid-box">
			<YMTextArea
				id="arrayList-string-value"
				v-focus
				:model-value="props.modelValue"
				@update:model-value="emit('update:modelValue', $event)"
			/>
		</div>
	</YMWindowFrame>
</template>

<style module>
:global(#arrayList-string) {
	width: 300px;
	height: 122px;
}

:global(#arrayList-string-value) {
	position: absolute;
	left: 10px;
	top: 10px;
	width: 280px;
	height: 44px;
}
</style>
