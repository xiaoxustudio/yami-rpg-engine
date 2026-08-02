<template>
	<WindowFrame id="deleteElement">
		<TitleBar>Delete Element<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Operation</text><select-box id="deleteElement-operation" />
				<text>Element</text><custom-box id="deleteElement-element" type="element" />
			</grid-box>
			<button id="deleteElement-confirm" name="confirm">Confirm</button>
			<button id="deleteElement-cancel" name="cancel">Cancel</button>
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
