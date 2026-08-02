<template>
	<WindowFrame id="setTriggerMotion">
		<TitleBar>Set Trigger Motion<close /></TitleBar>
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
