<template>
	<window-frame id="setTriggerSpeed">
		<title-bar>Set Trigger Speed<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Trigger</text
				><custom-box id="setTriggerSpeed-trigger" type="trigger" /> <text>Speed</text
				><number-var
					id="setTriggerSpeed-speed"
					min="0"
					max="512"
					decimals="4"
					unit="t/s"
				 />
			</grid-box>
			<button id="setTriggerSpeed-confirm" name="confirm">Confirm</button>
			<button id="setTriggerSpeed-cancel" name="cancel">Cancel</button>
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
