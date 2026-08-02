<template>
	<WindowFrame id="exportLanguage">
		<TitleBar>Export Language Pack<close></close></TitleBar>
		<content-frame>
			<grid-box>
				<text>First Lang</text><select-box id="exportLanguage-first" />
				<text>Second Lang</text><select-box id="exportLanguage-second" />
			</grid-box>
			<button id="exportLanguage-confirm" name="confirm">Confirm</button>
			<button id="exportLanguage-cancel" name="cancel">Cancel</button>
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
