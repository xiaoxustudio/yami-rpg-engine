<template>
<window-frame id="requestURL">
	<title-bar>requestURL<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>URL</text><string-var id="requestURL-url" /> <text>Header</text
			><param-list id="requestURL-header" /> <text>Method</text
			><select-box id="requestURL-method" /> <text>Data</text
			><param-list id="requestURL-data" /> <text>CallBack</text
			><custom-box id="requestURL-callback" type="file" filter="event" />
		</grid-box>
		<button id="requestURL-confirm" name="confirm">Confirm</button>
		<button id="requestURL-cancel" name="cancel">Cancel</button>
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
