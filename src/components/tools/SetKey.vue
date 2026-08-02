<template>
		<WindowFrame id="setKey">
		<TitleBar>Set Key<div class="close"></div></TitleBar>
		<content-frame>
			<grid-box> <text>Key</text><TextBox id="setKey-key" /> </grid-box>
			<button id="setKey-confirm" name="confirm">Confirm</button>
			<button id="setKey-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TextBox from '@app/components/common/TextBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
