<template>
	<WindowFrame id="createElement">
		<TitleBar>Create Element<close /></TitleBar>
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
