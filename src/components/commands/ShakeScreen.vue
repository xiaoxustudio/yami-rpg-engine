<template>
	<window-frame id="shakeScreen">
		<title-bar>Tint Screen<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Shake Mode</text><select-box id="shakeScreen-mode" /> <text>Power</text
				><number-box id="shakeScreen-power" min="1" max="10" /> <text>Speed</text
				><number-box id="shakeScreen-speed" min="1" max="10" /> <text>Easing</text
				><select-box id="shakeScreen-easingId" name="easing" /> <text>Duration</text
				><number-box
					id="shakeScreen-duration"
					name="duration"
					min="1"
					max="3600000"
					unit="ms"
				 />
				<text>Wait</text><select-box id="shakeScreen-wait" name="wait" />
			</grid-box>
			<button id="shakeScreen-confirm" name="confirm">Confirm</button>
			<button id="shakeScreen-cancel" name="cancel">Cancel</button>
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
