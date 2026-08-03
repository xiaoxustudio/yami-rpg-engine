<template>
	<WindowFrame id="imageClip">
		<TitleBar
			>Image Clip<div class="maximize"></div>
			<div class="close"></div>
		</TitleBar>
		<div class="content-frame">
			<box id="imageClip-screen" tabindex="-1">
				<img id="imageClip-image" />
				<MarqueeArea id="imageClip-marquee" />
			</box>
			<div class="flex-box" id="imageClip-flex">
				<NumberBox id="imageClip-x" min="0" max="10000"
					><text class="label">X:</text></NumberBox
				>
				<NumberBox id="imageClip-y" min="0" max="10000"
					><text class="label">Y:</text></NumberBox
				>
				<NumberBox id="imageClip-width" min="0" max="10000"
					><text class="label">W:</text></NumberBox
				>
				<NumberBox id="imageClip-height" min="0" max="10000"
					><text class="label">H:</text></NumberBox
				>
			</div>
			<button id="imageClip-confirm" name="confirm">Confirm</button>
			<button id="imageClip-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
