<template>
<window-frame id="setVolume">
	<title-bar>Set Volume<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Type</text><select-box id="setVolume-type" /> <text>Volume</text
			><number-var id="setVolume-volume" min="0" max="1" step="0.1" decimals="4" />
			<text>Easing</text><select-box id="setVolume-easingId" name="easing" />
			<text>Duration</text
			><number-box
				id="setVolume-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
			 />
			<text>Wait</text><select-box id="setVolume-wait" name="wait" />
		</grid-box>
		<button id="setVolume-confirm" name="confirm">Confirm</button>
		<button id="setVolume-cancel" name="cancel">Cancel</button>
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
