<template>
		<window-frame id="request-keyValue">
		<title-bar>Header<close></close></title-bar>
		<content-frame>
			<grid-box>
				<text>key</text><string-var id="request-keyValue-key" /> <text>value</text
				><string-var id="request-keyValue-value" />
			</grid-box>
			<button id="request-keyValue-confirm" name="confirm">Confirm</button>
			<button id="request-keyValue-cancel" name="cancel">Cancel</button>
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
