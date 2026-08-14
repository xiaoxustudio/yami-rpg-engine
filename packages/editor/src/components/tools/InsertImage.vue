<template>
	<WindowFrame ref="frame" id="insertImage" @confirm="onConfirm">
		<template #title><TitleBar>Insert Image<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Mode</div><SelectBox id="insertImage-mode" :model-value="form.mode" /> <div class="text">Image</div
				><CustomBox id="insertImage-image" type="file" filter="image" :model-value="form.image" />
				<div class="text">Clip</div
				><CustomBox id="insertImage-clip" type="clip" image="insertImage-image" :model-value="form.clip" />
				<div class="text">Width</div><NumberBox id="insertImage-width" min="0" max="10000" :model-value="form.width" />
				<div class="text">Height</div><NumberBox id="insertImage-height" min="0" max="10000" :model-value="form.height" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import type { InsertImageForm } from '@/tools/text-capture.ts';
import { Selection } from '@/tools/text-capture.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const form = reactive<InsertImageForm>({
	mode: 'image',
	image: '',
	clip: [0, 0, 64, 64],
	width: 64,
	height: 64
});

const setForm = (data: Partial<InsertImageForm>): void => {
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

const getForm = (): InsertImageForm => {
	const data = { ...form } as InsertImageForm;
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

const FIELD_BY_ID: Record<string, keyof InsertImageForm> = {
	'insertImage-mode': 'mode',
	'insertImage-image': 'image',
	'insertImage-clip': 'clip',
	'insertImage-width': 'width',
	'insertImage-height': 'height'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Selection?.image?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
	}
	inspector.syncState();
	local.syncState();
});
</script>
