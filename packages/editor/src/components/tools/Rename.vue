<template>
		<WindowFrame ref="frame" id="rename" @confirm="onConfirm">
		<template #title><TitleBar>Rename<div class="close"></div></TitleBar></template>
		
			<div class="grid-box"> <div class="text">Name</div
			><TextBox id="rename-name" :model-value="form.name" /> </div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRenameWindow, type RenameForm } from '@app/composables/useRenameWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import TextBox from '@app/components/common/TextBox.vue';

const rename = useRenameWindow();
const form = rename.form;

const setForm = (data: Partial<RenameForm>): void => {
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

const getForm = (): RenameForm => {
	const data = { ...form } as RenameForm;
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

const FIELD_BY_ID: Record<string, keyof RenameForm> = {
	'rename-name': 'name'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	rename.confirm();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
		el.on('closed', () => rename.onWindowClosed());
	}


});
</script>
