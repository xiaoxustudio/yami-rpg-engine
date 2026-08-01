<template>
	<window-frame id="setTriggerMotion">
		<title-bar>Set Trigger Motion<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Trigger</text
				><custom-box id="setTriggerMotion-trigger" type="trigger" />
				<text>Motion</text
				><custom-box id="setTriggerMotion-motion" type="enum-string" />
			</grid-box>
			<button id="setTriggerMotion-confirm" name="confirm">Confirm</button>
			<button id="setTriggerMotion-cancel" name="cancel">Cancel</button>
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
