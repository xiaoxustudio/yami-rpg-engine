<template>
	<WindowFrame ref="frame" id="color" @confirm="onConfirm">
		<template #title><TitleBar>Color Picker<div class="close" /></TitleBar></template>
		
			<canvas id="color-palette-canvas" width="256" height="194" />
			<div class="box" id="color-palette-frame">
				<div class="box" id="color-palette-cursor" />
			</div>
			<div class="grid-box" id="color-index-grid">
				<RadioBox name="color-index" value="0" @input="onIndexedInput" />
				<RadioBox name="color-index" value="1" @input="onIndexedInput" />
				<RadioBox name="color-index" value="2" @input="onIndexedInput" />
				<RadioBox name="color-index" value="3" @input="onIndexedInput" />
				<RadioBox name="color-index" value="4" @input="onIndexedInput" />
				<RadioBox name="color-index" value="5" @input="onIndexedInput" />
				<RadioBox name="color-index" value="6" @input="onIndexedInput" />
				<RadioBox name="color-index" value="7" @input="onIndexedInput" />
				<RadioBox name="color-index" value="8" @input="onIndexedInput" />
				<RadioBox name="color-index" value="9" @input="onIndexedInput" />
				<RadioBox name="color-index" value="10" @input="onIndexedInput" />
				<RadioBox name="color-index" value="11" @input="onIndexedInput" />
				<RadioBox name="color-index" value="12" @input="onIndexedInput" />
				<RadioBox name="color-index" value="13" @input="onIndexedInput" />
				<RadioBox name="color-index" value="14" @input="onIndexedInput" />
				<RadioBox name="color-index" value="15" @input="onIndexedInput" />
			</div>
			<canvas id="color-pillar-canvas" width="20" height="256" />
			<div class="box" id="color-pillar-frame">
				<div class="box" id="color-pillar-cursor" />
			</div>
			<div class="box" id="color-viewer-frame">
				<div class="box" id="color-viewer" />
			</div>
			<div class="grid-box" id="color-rgba-grid">
				<div class="text">#</div><TextBox id="color-hex" :model-value="form.hex" @beforeinput="onHexBeforeinput" @input="onHexInput" /> <div class="text">R</div
				><NumberBox id="color-r" min="0" max="255" :model-value="form.r" @input="onRgbaInput" /> <div class="text">G</div
				><NumberBox id="color-g" min="0" max="255" :model-value="form.g" @input="onRgbaInput" /> <div class="text">B</div
				><NumberBox id="color-b" min="0" max="255" :model-value="form.b" @input="onRgbaInput" /> <div class="text">A</div
				><NumberBox id="color-a" min="0" max="255" :model-value="form.a" @input="onRgbaInput" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Color } from '@/tools/color-picker-window.ts';
import { useColorWindow, type ColorForm } from '@app/composables/useColorWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import NumberBox from '@app/components/common/NumberBox.vue';
import RadioBox from '@app/components/common/RadioBox.vue';
import TextBox from '@app/components/common/TextBox.vue';

const color = useColorWindow();
const form = color.form;

const setForm = (data: Partial<ColorForm>): void => {
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

const getForm = (): ColorForm => {
	const data = { ...form } as ColorForm;
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

const FIELD_BY_ID: Record<string, keyof ColorForm> = {
	'color-hex': 'hex',
	'color-r': 'r',
	'color-g': 'g',
	'color-b': 'b',
	'color-a': 'a',
	'color-index': 'index'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onIndexedInput = (value: number | string | boolean) => {
	Color?.indexedColorInput?.({ value: String(value) });
};
const onRgbaInput = () => {
	Color?.rgbaInput?.();
};
const onHexBeforeinput = (event: InputEvent) => {
	Color?.hexBeforeinput?.(event);
};
const onHexInput = () => {
	Color?.hexInput?.();
};
const onConfirm = () => {
	color.confirm();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
		el.on('closed', () => color.onWindowClosed());
	}


});
</script>
