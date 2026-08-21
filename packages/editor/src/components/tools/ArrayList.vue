<template>
	<WindowFrame ref="frame" id="arrayList" mode="center">
		<template #title><TitleBar>Array<div class="close" /></TitleBar></template>
		
			<ParamList id="arrayList-list" @change="onListChange" />
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useArrayWindow } from '@app/composables/useArrayWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import ParamList from '@app/components/common/ParamList.vue';

const arrayWindow = useArrayWindow();
const form = arrayWindow.form;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onListChange = () => {
	const control = document.getElementById('arrayList-list') as
		| (HTMLElement & { read?: () => unknown[] | null })
		| null;
	form.values = control?.read?.() ?? form.values;
	arrayWindow.markChanged();
};

watch(
	() => form.values,
	(values) => {
		const control = document.getElementById('arrayList-list') as
			| (HTMLElement & { write?: (data: unknown[]) => void })
			| null;
		if (control && typeof control.write === 'function') {
			control.write(values);
		}
	},
	{ flush: 'sync' }
);

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		el.on('closed', () => arrayWindow.onWindowClosed());
	}
});
</script>
