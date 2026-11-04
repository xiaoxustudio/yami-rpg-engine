<template>
	<WindowFrame ref="frame" id="imageClip" @confirm="onConfirm">
		<template #title
			><TitleBar
				>Image Clip
				<div class="maximize"></div>
				<div class="close"></div> </TitleBar
		></template>

		<div class="box" id="imageClip-screen" ref="screenEl" tabindex="-1">
			<img id="imageClip-image" alt="" ref="imageEl" />
			<MarqueeArea id="imageClip-marquee" ref="marqueeRef" />
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
import { onMounted, onUnmounted, ref } from 'vue';
import {
	provideImageCropHandles,
	resetImageCropHandles,
	type CropMarquee
} from '@app/composables/image-crop-handles';
import { ImageClip } from '@app/tools/image-crop-window.ts';
import { useImageClipWindow } from '@app/composables/useImageClipWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { on } from '@app/utils/element-utils';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const imageClip = useImageClipWindow();
const form = imageClip.form;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);
const screenEl = ref<HTMLElement | null>(null);
const imageEl = ref<HTMLImageElement | null>(null);
const marqueeRef = ref<InstanceType<typeof MarqueeArea> | null>(null);

const onParamInput = () => {
	ImageClip?.paramInput?.(new Event('input'));
};
const onConfirm = () => {
	imageClip.confirm();
};

/** 长期持有的四个节点一次交给单例（它跨 open/close 复用，不是每次取一次的形状）。 */
let handles: Parameters<typeof provideImageCropHandles>[0] | null = null;

onMounted(() => {
	const win = frame.value?.root;
	const marquee = (marqueeRef.value?.root ?? null) as CropMarquee | null;
	if (!win || !screenEl.value || !imageEl.value || !marquee) return;
	on(win, 'closed', () => imageClip.onWindowClosed());
	handles = {
		win,
		screen: screenEl.value,
		image: imageEl.value,
		marquee
	};
	provideImageCropHandles(handles);
	onUnmounted(() => {
		if (handles) resetImageCropHandles(handles);
	});
});
</script>

<style>
#imageClip {
	width: 1080px;
	height: 700px;
}

#imageClip-screen {
	position: absolute;
	top: 0;
	bottom: 40px;
	width: 100%;
	overflow: auto;
	background-color: var(--viewer-background);
	border-bottom: var(--input-border);
}

#imageClip-image {
	position: absolute;
	background-image: var(--grid-background);
	background-size: var(--16dpx);
}

#imageClip-flex {
	position: absolute;
	margin-left: auto;
	margin-right: auto;
	left: 206px;
	right: 206px;
	bottom: 10px;
	max-width: 412px;
}

#imageClip-x,
#imageClip-y,
#imageClip-width,
#imageClip-height {
	width: 100px;
}

#imageClip-confirm {
	right: 108px;
	bottom: 10px;
}

#imageClip-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
