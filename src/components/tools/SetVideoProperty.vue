<template>
	<!-- 设置视频 - 属性 -->
	<window-frame id="setVideo-property">
		<title-bar>Image Property<close /></title-bar>
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
	</window-frame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
