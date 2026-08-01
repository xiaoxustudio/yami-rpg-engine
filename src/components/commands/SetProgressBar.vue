<template>
	<window-frame id="setProgressBar">
		<title-bar>Set Progress Bar<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Element</text><custom-box id="setProgressBar-element" type="element" />
				<text>Properties</text><param-list id="setProgressBar-properties" />
			</grid-box>
			<button id="setProgressBar-confirm" name="confirm">Confirm</button>
			<button id="setProgressBar-cancel" name="cancel">Cancel</button>
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
