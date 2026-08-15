<template>
	<!-- 缩放窗口 -->
	<WindowFrame ref="frame" id="zoom" @confirm="onConfirm">
		<template #title><TitleBar>Zoom<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Zoom Factor</div
				><NumberBox
					id="zoom-factor"
					min="0.6666"
					max="2"
					decimals="4"
					:model-value="form.factor"
				/>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useZoomWindow, type ZoomForm } from '@app/composables/useZoomWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import NumberBox from '@app/components/common/NumberBox.vue';

const zoom = useZoomWindow();
const form = zoom.form;

const setForm = (data: Partial<ZoomForm>): void => {
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

const getForm = (): ZoomForm => {
	const data = { ...form } as ZoomForm;
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

const FIELD_BY_ID: Record<string, keyof ZoomForm> = {
	'zoom-factor': 'factor'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	zoom.confirm();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
	}


});
</script>
