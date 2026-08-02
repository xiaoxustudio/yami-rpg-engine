<template>
		<WindowFrame id="rename">
		<TitleBar>Rename<close></close></TitleBar>
		<content-frame>
			<grid-box> <text>Name</text><text-box id="rename-name" /> </grid-box>
			<button id="rename-confirm" name="confirm">Confirm</button>
			<button id="rename-cancel" name="cancel">Cancel</button>
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
