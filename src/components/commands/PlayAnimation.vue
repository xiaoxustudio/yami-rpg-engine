<template>
	<window-frame id="playAnimation">
		<title-bar>Play Animation<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Mode</text><select-box id="playAnimation-mode" /> <text>Position</text
				><custom-box id="playAnimation-position" type="position" /> <text>Actor</text
				><custom-box id="playAnimation-actor" type="actor" /> <text>Animation</text
				><custom-box id="playAnimation-animationId" type="file" filter="animation" />
				<text>Motion</text><select-box id="playAnimation-motion" />
				<text>Rotatable</text><select-box id="playAnimation-rotatable" />
				<text>Priority</text
				><number-box id="playAnimation-priority" min="-100" max="100" />
				<text>Offset Y</text
				><number-var
					id="playAnimation-offsetY"
					min="-1000000000"
					max="1000000000"
					unit="px"
				 />
				<text>Angle</text
				><number-var
					id="playAnimation-angle"
					min="-360"
					max="360"
					decimals="4"
					unit="deg"
				 />
				<text>Speed</text
				><number-var
					id="playAnimation-speed"
					min="0.1"
					max="10"
					step="0.1"
					decimals="4"
				 />
				<text>Wait</text><select-box id="playAnimation-wait" name="wait" />
			</grid-box>
			<button id="playAnimation-confirm" name="confirm">Confirm</button>
			<button id="playAnimation-cancel" name="cancel">Cancel</button>
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
