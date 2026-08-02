<template>
<WindowFrame id="label">
	<TitleBar>Label<close /></TitleBar>
	<content-frame>
		<grid-box> <text>Label Name</text><TextBox id="label-name" /> </grid-box>
		<button id="label-confirm" name="confirm">Confirm</button>
		<button id="label-cancel" name="cancel">Cancel</button>
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
