<template>
	<WindowFrame id="controlDialog">
		<TitleBar>Control Dialog<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Element</text><custom-box id="controlDialog-element" type="element" />
				<text>Operation</text><select-box id="controlDialog-operation" />
			</grid-box>
			<button id="controlDialog-confirm" name="confirm">Confirm</button>
			<button id="controlDialog-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
