<template>
	<WindowFrame ref="frame" id="imageClip" @confirm="onConfirm">
		<template #title><TitleBar
			>Image Clip<div class="maximize"></div>
			<div class="close"></div>
		</TitleBar></template>
		
			<div class="box" id="imageClip-screen" tabindex="-1">
				<img id="imageClip-image" />
				<MarqueeArea id="imageClip-marquee" />
			</div>
			<div class="flex-box" id="imageClip-flex">
				<NumberBox id="imageClip-x" min="0" max="10000" :model-value="form.x" @input="onParamInput"
					><div class="text label">X:</div></NumberBox
				>
				<NumberBox id="imageClip-y" min="0" max="10000" :model-value="form.y" @input="onParamInput"
					><div class="text label">Y:</div></NumberBox
				>
				<NumberBox id="imageClip-width" min="0" max="10000" :model-value="form.width" @input="onParamInput"
					><div class="text label">W:</div></NumberBox
				>
				<NumberBox id="imageClip-height" min="0" max="10000" :model-value="form.height" @input="onParamInput"
					><div class="text label">H:</div></NumberBox
				>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ImageClip } from '@app/tools/image-crop-window.ts';
import { useImageClipWindow, type ImageClipForm } from '@app/composables/useImageClipWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/utils/attach-element-api';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const imageClip = useImageClipWindow();
const form = imageClip.form;

const setForm = (data: Partial<ImageClipForm>): void => {
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

const getForm = (): ImageClipForm => {
	const data = { ...form } as ImageClipForm;
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

const FIELD_BY_ID: Record<string, keyof ImageClipForm> = {
	'imageClip-x': 'x',
	'imageClip-y': 'y',
	'imageClip-width': 'width',
	'imageClip-height': 'height'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onParamInput = () => {
	ImageClip?.paramInput?.();
};
const onConfirm = () => {
	imageClip.confirm();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
		el.on('closed', () => imageClip.onWindowClosed());
	}


});
</script>
