<template>
	<!-- 设置视频 - 属性 -->
	<WindowFrame id="setVideo-property">
		<TitleBar>Image Property<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Property</text><select-box id="setVideo-property-key" />
				<text>Video</text
				><custom-box id="setVideo-property-video" type="file" filter="video" />
				<text>Playback Rate</text
				><number-var
					id="setVideo-property-playbackRate"
					min="0"
					max="4"
					decimals="4"
				/>
				<text>Loop</text><select-box id="setVideo-property-loop" /> <text>Flip</text
				><select-box id="setVideo-property-flip" /> <text>Blend</text
				><select-box id="setVideo-property-blend" />
			</grid-box>
			<button id="setVideo-property-confirm" name="confirm">Confirm</button>
			<button id="setVideo-property-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
