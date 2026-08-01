<template>
	<window-frame id="importLanguage">
		<title-bar>Import Language Pack<close></close></title-bar>
		<content-frame>
			<grid-box>
				<text>Import to</text><select-box id="importLanguage-language" />
			</grid-box>
			<button id="importLanguage-confirm" name="confirm">Confirm</button>
			<button id="importLanguage-cancel" name="cancel">Cancel</button>
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
