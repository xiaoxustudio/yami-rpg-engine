<template>
	<window-frame id="setTextBox">
		<title-bar>Set Text Box<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Element</text><custom-box id="setTextBox-element" type="element" />
				<text>Properties</text><param-list id="setTextBox-properties" />
			</grid-box>
			<button id="setTextBox-confirm" name="confirm">Confirm</button>
			<button id="setTextBox-cancel" name="cancel">Cancel</button>
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
