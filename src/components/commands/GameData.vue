<template>
	<WindowFrame id="gameData">
		<TitleBar>Game Data<div class="close" /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Operation</text><SelectBox id="gameData-operation" />
				<text>Index</text><NumberVar id="gameData-index" min="0" max="32" />
				<text>Variables</text><TextBox id="gameData-variables" />
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
import NumberVar from '@app/components/common/NumberVar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
