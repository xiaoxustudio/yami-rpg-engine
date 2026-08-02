<template>
<WindowFrame id="requestURL">
	<TitleBar>requestURL<close /></TitleBar>
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
