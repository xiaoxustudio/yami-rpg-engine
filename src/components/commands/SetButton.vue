<template>
	<window-frame id="setButton">
		<title-bar>Set Button<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Element</text><custom-box id="setButton-element" type="element" />
				<text>Properties</text><param-list id="setButton-properties" />
			</grid-box>
			<button id="setButton-confirm" name="confirm">Confirm</button>
			<button id="setButton-cancel" name="cancel">Cancel</button>
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
