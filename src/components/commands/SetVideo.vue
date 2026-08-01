<template>
	<window-frame id="setVideo">
		<title-bar>Set Video<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Element</text><custom-box id="setVideo-element" type="element" />
				<text>Properties</text><param-list id="setVideo-properties" />
			</grid-box>
			<button id="setVideo-confirm" name="confirm">Confirm</button>
			<button id="setVideo-cancel" name="cancel">Cancel</button>
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
