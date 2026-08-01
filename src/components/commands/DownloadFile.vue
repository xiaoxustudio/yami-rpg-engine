<template>
<window-frame id="downloadFile">
	<title-bar>downloadFile<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>URL</text><string-var id="downloadFile-url" /> <text>Header</text
			><param-list id="downloadFile-header" /> <text>Method</text
			><select-box id="downloadFile-method" /> <text>Data</text
			><param-list id="downloadFile-data" /> <text>CallBack</text
			><custom-box id="downloadFile-callback" type="file" filter="event" />
			<text>RateCallBack</text
			><custom-box id="downloadFile-rateCallback" type="file" filter="event" />
			<text>IsBackground</text
			><check-box class="standard" id="downloadFile-isBackground" />
			<text>Path</text><string-var id="downloadFile-isBackground-path" />
		</grid-box>
		<button id="downloadFile-confirm" name="confirm">Confirm</button>
		<button id="downloadFile-cancel" name="cancel">Cancel</button>
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
