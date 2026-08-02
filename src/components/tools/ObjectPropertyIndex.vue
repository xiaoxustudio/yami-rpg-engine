<template>
	<WindowFrame id="ObjectProperty-index">
		<TitleBar>ObjectProperty-index<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>IndexName</text><text-box id="ObjectProperty-index-name" />
			</grid-box>
			<button id="ObjectProperty-index-confirm" name="confirm">Confirm</button>
			<button id="ObjectProperty-index-cancel" name="cancel">Cancel</button>
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
