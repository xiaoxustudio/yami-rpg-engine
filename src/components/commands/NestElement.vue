<template>
	<WindowFrame id="nestElement">
		<TitleBar>Nest Element<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Parent Element</text
				><custom-box id="nestElement-parent" type="element" />
				<text>Child Element</text
				><custom-box id="nestElement-child" type="element" />
			</grid-box>
			<button id="nestElement-confirm" name="confirm">Confirm</button>
			<button id="nestElement-cancel" name="cancel">Cancel</button>
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
