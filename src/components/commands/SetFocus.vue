<template>
	<window-frame id="setFocus">
		<title-bar>Set Focus<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Operation</text><select-box id="setFocus-operation" />
				<text>Element</text><custom-box id="setFocus-element" type="element" />
				<text>Mode</text><select-box id="setFocus-mode" /> <text>Cancelable</text
				><check-box id="setFocus-cancelable" class="standard large" />
			</grid-box>
			<button id="setFocus-confirm" name="confirm">Confirm</button>
			<button id="setFocus-cancel" name="cancel">Cancel</button>
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
