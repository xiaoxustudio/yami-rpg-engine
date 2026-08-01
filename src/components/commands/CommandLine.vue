<template>
	<window-frame id="commandLine">
		<title-bar>Command Line<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Type</text><select-box id="commandLine-type" /> <text>Key</text
				><string-var id="commandLine-key" /> <text>Value</text
				><string-var id="commandLine-value" /> <text>Variable</text
				><custom-box id="commandLine-variable" type="variable" filter="object" />
			</grid-box>
			<button id="commandLine-confirm" name="confirm">Confirm</button>
			<button id="commandLine-cancel" name="cancel">Cancel</button>
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
