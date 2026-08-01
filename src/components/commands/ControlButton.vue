<template>
	<window-frame id="controlButton">
		<title-bar>Control Button<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Operation</text><select-box id="controlButton-operation" />
				<text>Element</text><custom-box id="controlButton-element" type="element" />
			</grid-box>
			<button id="controlButton-confirm" name="confirm">Confirm</button>
			<button id="controlButton-cancel" name="cancel">Cancel</button>
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
