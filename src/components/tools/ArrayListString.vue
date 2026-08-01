<template>
	<window-frame id="arrayList-string">
		<title-bar>String<close /></title-bar>
		<content-frame>
			<text-area id="arrayList-string-value" />
			<button id="arrayList-string-confirm" name="confirm">Confirm</button>
			<button id="arrayList-string-cancel" name="cancel">Cancel</button>
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
