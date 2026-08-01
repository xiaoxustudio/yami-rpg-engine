<template>
	<window-frame id="deleteElement">
		<title-bar>Delete Element<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Operation</text><select-box id="deleteElement-operation" />
				<text>Element</text><custom-box id="deleteElement-element" type="element" />
			</grid-box>
			<button id="deleteElement-confirm" name="confirm">Confirm</button>
			<button id="deleteElement-cancel" name="cancel">Cancel</button>
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
