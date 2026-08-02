<template>
	<WindowFrame id="ancestorGetter">
		<TitleBar>Element<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Type</text><select-box id="ancestorGetter-type" /> <text>Data ID</text
				><custom-box id="ancestorGetter-presetId" type="preset-element" />
				<text>Variable</text
				><custom-box id="ancestorGetter-variable" type="variable" filter="object" />
			</grid-box>
			<button id="ancestorGetter-confirm" name="confirm">Confirm</button>
			<button id="ancestorGetter-cancel" name="cancel">Cancel</button>
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
