<template>
<WindowFrame id="httpRequest">
	<TitleBar>httpRequest<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>URL</text><string-var id="httpRequest-url" /> <text>Method</text
			><select-box id="httpRequest-method" /> <text>Header</text
			><param-list id="httpRequest-header" /> <text>Data</text
			><param-list id="httpRequest-data" /> <text>TimeOut</text
			><number-box id="httpRequest-timeout" /> <text>ResponseType</text
			><select-box id="httpRequest-responseType" /> <text>WithCredentials</text
			><check-box class="standard" id="httpRequest-withCredentials" />
			<text>AuthUser</text><string-var id="httpRequest-authUser" />
			<text>AuthPass</text><string-var id="httpRequest-authPass" />
			<text>CallBack</text
			><custom-box id="httpRequest-callback" type="file" filter="event" />
		</grid-box>
		<button id="httpRequest-confirm" name="confirm">Confirm</button>
		<button id="httpRequest-cancel" name="cancel">Cancel</button>
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
