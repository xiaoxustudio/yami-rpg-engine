<template>
	<window-frame id="setTriggerAngle">
		<title-bar>Set Trigger Angle<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Trigger</text
				><custom-box id="setTriggerAngle-trigger" type="trigger" /> <text>Angle</text
				><custom-box id="setTriggerAngle-angle" type="angle" />
			</grid-box>
			<button id="setTriggerAngle-confirm" name="confirm">Confirm</button>
			<button id="setTriggerAngle-cancel" name="cancel">Cancel</button>
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
