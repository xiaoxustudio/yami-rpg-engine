<template>
	<WindowFrame ref="frame" id="imageClip" @confirm="onConfirm">
		<template #title
			><TitleBar
				>Image Clip
				<div class="maximize"></div>
				<div class="close"></div> </TitleBar
		></template>

		<div class="box" id="imageClip-screen" tabindex="-1">
			<img id="imageClip-image" />
			<MarqueeArea id="imageClip-marquee" />
		</div>
		<div class="flex-box" id="imageClip-flex">
			<NumberBox id="imageClip-x" min="0" max="10000" v-model="form.x" @input="onParamInput"
				><div class="text label">X:</div></NumberBox
			>
			<NumberBox id="imageClip-y" min="0" max="10000" v-model="form.y" @input="onParamInput"
				><div class="text label">Y:</div></NumberBox
			>
			<NumberBox
				id="imageClip-width"
				min="0"
				max="10000"
				v-model="form.width"
				@input="onParamInput"
				><div class="text label">W:</div></NumberBox
			>
			<NumberBox
				id="imageClip-height"
				min="0"
				max="10000"
				v-model="form.height"
				@input="onParamInput"
				><div class="text label">H:</div></NumberBox
			>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ImageClip } from '@app/tools/image-crop-window.ts';
import { useImageClipWindow } from '@app/composables/useImageClipWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { on } from '@app/utils/element-utils';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const imageClip = useImageClipWindow();
const form = imageClip.form;

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
		on(el, 'closed', () => imageClip.onWindowClosed());
	}
});
</script>
