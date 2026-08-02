<template>
	<WindowFrame id="gameData">
		<TitleBar>Game Data<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Operation</text><select-box id="gameData-operation" />
				<text>Index</text><number-var id="gameData-index" min="0" max="32" />
				<text>Variables</text><text-box id="gameData-variables" />
			</grid-box>
			<button id="gameData-confirm" name="confirm">Confirm</button>
			<button id="gameData-cancel" name="cancel">Cancel</button>
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
