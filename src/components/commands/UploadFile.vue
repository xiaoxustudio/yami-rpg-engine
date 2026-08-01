<template>
	<window-frame id="uploadFile">
		<title-bar>uploadFile<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>URL</text><string-var id="uploadFile-url" /> <text>LocalPath</text
				><string-var id="uploadFile-path" /> <text>Method</text
				><select-box id="uploadFile-method" /> <text>Field</text
				><string-var id="uploadFile-field" /> <text>Header</text
				><param-list id="uploadFile-header" /> <text>CallBack</text
				><custom-box id="uploadFile-callback" type="file" filter="event" />
				<text>RateCallBack</text
				><custom-box id="uploadFile-rateCallback" type="file" filter="event" />
			</grid-box>
			<button id="uploadFile-confirm" name="confirm">Confirm</button>
			<button id="uploadFile-cancel" name="cancel">Cancel</button>
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
