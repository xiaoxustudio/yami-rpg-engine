<script setup lang="ts">
import { onMounted, ref } from 'vue';
import YMWindowFrame from '../YMWindowFrame/YMWindowFrame.vue';
import YMTitleBar from '../YMTitleBar/YMTitleBar.vue';
import YMStringVar from '../../basic/YMStringVar/YMStringVar.vue';

interface Props {
	keyValue?: string;
	value?: string;
	keyLabel?: string;
	valueLabel?: string;
	title?: string;
}

const props = withDefaults(defineProps<Props>(), {
	keyValue: '',
	value: '',
	keyLabel: '',
	valueLabel: '',
	title: ''
});

const emit = defineEmits<{
	'update:keyValue': [value: string];
	'update:value': [value: string];
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
	<YMWindowFrame ref="frame" id="request-keyValue" @closed="emit('closed')">
		<template #title>
			<YMTitleBar>
				{{ props.title }}
				<div class="close" />
			</YMTitleBar>
		</template>
		<div class="grid-box">
			<div class="text">{{ props.keyLabel }}</div>
			<YMStringVar
				id="request-keyValue-key"
				:model-value="props.keyValue"
				@update:model-value="emit('update:keyValue', String($event))"
			/>
			<div class="text">{{ props.valueLabel }}</div>
			<YMStringVar
				id="request-keyValue-value"
				:model-value="props.value"
				@update:model-value="emit('update:value', String($event))"
			/>
		</div>
	</YMWindowFrame>
</template>
