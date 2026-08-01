<template>
	<window-frame id="setLanguage">
		<title-bar>Set Language<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Language</text><select-box id="setLanguage-language" />
			</grid-box>
			<button id="setLanguage-confirm" name="confirm">Confirm</button>
			<button id="setLanguage-cancel" name="cancel">Cancel</button>
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
