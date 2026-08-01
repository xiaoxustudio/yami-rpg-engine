<template>
	<window-frame id="tintScreen">
		<title-bar>Tint Screen<close /></title-bar>
		<content-frame>
			<grid-box id="tintScreen-grid-box">
				<text>Tint - Red</text
				><number-box id="tintScreen-tint-0" min="-255" max="255" step="5" />
				<text>Tint - Green</text
				><number-box id="tintScreen-tint-1" min="-255" max="255" step="5" />
				<text>Tint - Blue</text
				><number-box id="tintScreen-tint-2" min="-255" max="255" step="5" />
				<text>Tint - Grayscale</text
				><number-box id="tintScreen-tint-3" min="0" max="255" step="5" />
				<text>Easing</text><select-box id="tintScreen-easingId" name="easing" />
				<text>Duration</text
				><number-box
					id="tintScreen-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
				 />
				<text>Wait</text><select-box id="tintScreen-wait" name="wait" />
			</grid-box>
			<filter-box id="tintScreen-filter" width="96" height="160" />
			<button id="tintScreen-confirm" name="confirm">Confirm</button>
			<button id="tintScreen-cancel" name="cancel">Cancel</button>
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
