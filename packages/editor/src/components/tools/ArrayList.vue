<template>
	<WindowFrame ref="frame" id="arrayList" mode="center">
		<template #title><TitleBar>Array<div class="close" /></TitleBar></template>
		
			<ParamList id="arrayList-list" @change="onListChange" />
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useArrayWindow, type ArrayForm } from '@app/composables/useArrayWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/utils/attach-element-api';
import ParamList from '@app/components/common/ParamList.vue';

const arrayWindow = useArrayWindow();
const form = arrayWindow.form;

const setForm = (data: Partial<ArrayForm>): void => {
	Object.assign(form, data);
	for (const [id, field] of Object.entries(FIELD_BY_ID)) {
		if (!(field in data)) continue;
		const control = document.getElementById(id) as
			| (HTMLElement & { write?: (value: unknown) => void })
			| null;
		if (control && typeof control.write === 'function') {
			control.write(data[field] as never);
		}
	}
};

const getForm = (): ArrayForm => {
	const data = { ...form } as ArrayForm;
	for (const [id, field] of Object.entries(FIELD_BY_ID)) {
		const control = document.getElementById(id) as
			| (HTMLElement & { read?: () => unknown })
			| null;
		if (control && typeof control.read === 'function') {
			data[field] = control.read() as never;
		}
	}
	return data;
};

const FIELD_BY_ID: Record<string, keyof ArrayForm> = {
	'arrayList-list': 'values'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onListChange = () => {
	arrayWindow.markChanged();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
		el.on('closed', () => arrayWindow.onWindowClosed());
	}


});
</script>
