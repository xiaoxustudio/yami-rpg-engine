<template>
	<window-frame id="waitForVideo">
		<title-bar>Wait For Video<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Element</text><custom-box id="waitForVideo-element" type="element" />
			</grid-box>
			<button id="waitForVideo-confirm" name="confirm">Confirm</button>
			<button id="waitForVideo-cancel" name="cancel">Cancel</button>
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
