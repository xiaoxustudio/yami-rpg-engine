<template>
	<WindowFrame id="elementGetter">
		<TitleBar>Element<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Type</text><select-box id="elementGetter-type" /> <text>Ancestor</text
				><custom-box id="elementGetter-ancestor" type="ancestor-element" />
				<text>Data ID</text
				><custom-box id="elementGetter-presetId" type="preset-element" />
				<text>Index</text><number-var id="elementGetter-index" min="0" max="10000" />
				<text>Variable</text
				><custom-box id="elementGetter-variable" type="variable" filter="object" />
			</grid-box>
			<button id="elementGetter-confirm" name="confirm">Confirm</button>
			<button id="elementGetter-cancel" name="cancel">Cancel</button>
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
