<template>
	<WindowFrame ref="frame" id="imageClip" @confirm="onConfirm">
		<template #title
			><TitleBar
				>Image Clip
				<div class="maximize"></div>
				<div class="close"></div> </TitleBar
		></template>

		<div class="box" id="imageClip-screen"
				:ref="registryRef(imageClipEls, 'imageClip-screen')" tabindex="-1">
			<img id="imageClip-image"
				:ref="registryRef(imageClipEls, 'imageClip-image')" />
			<MarqueeArea id="imageClip-marquee"
				:ref="registryRef(imageClipEls, 'imageClip-marquee')" />
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
import { imageClipEls } from '@app/tools/image-crop-window';
import { registryRef } from '@app/utils/element-registry';
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

const onParamInput = () => {
	ImageClip?.paramInput?.(new Event('input'));
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

<style>
/* 窗口样式迁移：由 Project/css/inspector.css 迁入组件（选择器为全局 id，不能用 scoped） */
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

