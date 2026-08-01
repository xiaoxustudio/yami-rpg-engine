<template>
	<window-frame id="exportLanguage">
		<title-bar>Export Language Pack<close></close></title-bar>
		<content-frame>
			<grid-box>
				<text>First Lang</text><select-box id="exportLanguage-first" />
				<text>Second Lang</text><select-box id="exportLanguage-second" />
			</grid-box>
			<button id="exportLanguage-confirm" name="confirm">Confirm</button>
			<button id="exportLanguage-cancel" name="cancel">Cancel</button>
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
