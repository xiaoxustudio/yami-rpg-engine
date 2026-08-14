<template>
		<WindowFrame ref="frame" id="scene-shift" @confirm="onConfirm">
		<template #title><TitleBar>Shift<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Shift X</div
				><NumberBox
					id="scene-shift-x"
					min="-512"
					max="512"
					:model-value="form.x"
				/>
				<div class="text">Shift Y</div
				><NumberBox
					id="scene-shift-y"
					min="-512"
					max="512"
					:model-value="form.y"
				/>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { SceneShift, type SceneShiftForm } from '@/scene/move-scene.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import NumberBox from '@app/components/common/NumberBox.vue';

const form = reactive<SceneShiftForm>({ x: 0, y: 0 });

const setForm = (data: Partial<SceneShiftForm>): void => {
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

const getForm = (): SceneShiftForm => {
	const data = { ...form } as SceneShiftForm;
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

const FIELD_BY_ID: Record<string, keyof SceneShiftForm> = {
	'scene-shift-x': 'x',
	'scene-shift-y': 'y'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	SceneShift?.confirm?.();
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
