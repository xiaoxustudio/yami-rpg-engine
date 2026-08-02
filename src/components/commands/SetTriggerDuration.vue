<template>
	<WindowFrame id="setTriggerDuration">
		<TitleBar>Set Trigger Duration<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Trigger</text
				><custom-box id="setTriggerDuration-trigger" type="trigger" />
				<text>Operation</text><select-box id="setTriggerDuration-operation" />
				<text>Duration</text
				><number-var
					id="setTriggerDuration-duration"
					min="0"
					max="3600000"
					unit="ms"
				 />
			</grid-box>
			<button id="setTriggerDuration-confirm" name="confirm">Confirm</button>
			<button id="setTriggerDuration-cancel" name="cancel">Cancel</button>
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
