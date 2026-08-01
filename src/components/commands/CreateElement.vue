<template>
	<window-frame id="createElement">
		<title-bar>Create Element<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Operation</text><select-box id="createElement-operation" />
				<text>Parent</text><custom-box id="createElement-parent" type="element" />
				<text>UI Elements</text
				><custom-box id="createElement-uiId" type="file" filter="ui" />
				<text>UI Element</text
				><custom-box id="createElement-presetId" type="preset-element" />
			</grid-box>
			<button id="createElement-confirm" name="confirm">Confirm</button>
			<button id="createElement-cancel" name="cancel">Cancel</button>
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
