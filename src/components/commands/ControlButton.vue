<template>
	<WindowFrame id="controlButton">
		<TitleBar>Control Button<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Operation</text><select-box id="controlButton-operation" />
				<text>Element</text><custom-box id="controlButton-element" type="element" />
			</grid-box>
			<button id="controlButton-confirm" name="confirm">Confirm</button>
			<button id="controlButton-cancel" name="cancel">Cancel</button>
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
