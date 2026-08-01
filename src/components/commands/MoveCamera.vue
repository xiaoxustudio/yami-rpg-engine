<template>
	<window-frame id="moveCamera">
		<title-bar>Move Camera<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Mode</text><select-box id="moveCamera-mode" /> <text>Position</text
				><custom-box id="moveCamera-position" type="position" /> <text>Actor</text
				><custom-box id="moveCamera-actor" type="actor" /> <text>Easing</text
				><select-box id="moveCamera-easingId" name="easing" /> <text>Duration</text
				><number-box
					id="moveCamera-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
				 />
				<text>Wait</text><select-box id="moveCamera-wait" name="wait" />
			</grid-box>
			<button id="moveCamera-confirm" name="confirm">Confirm</button>
			<button id="moveCamera-cancel" name="cancel">Cancel</button>
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
