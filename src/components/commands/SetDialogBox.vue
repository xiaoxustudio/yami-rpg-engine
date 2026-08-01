<template>
	<window-frame id="setDialogBox">
		<title-bar>Set Dialog Box<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Element</text><custom-box id="setDialogBox-element" type="element" />
				<text>Properties</text><param-list id="setDialogBox-properties" />
			</grid-box>
			<button id="setDialogBox-confirm" name="confirm">Confirm</button>
			<button id="setDialogBox-cancel" name="cancel">Cancel</button>
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
