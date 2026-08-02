<template>
		<WindowFrame id="presetObject" mode="center">
		<TitleBar>Object<close></close></TitleBar>
		<content-frame>
			<custom-box id="presetObject-sceneId" type="file" filter="scene" />
			<node-list id="presetObject-list" />
			<text-box id="presetObject-searcher" name="search" />
			<button id="presetObject-confirm" name="confirm">Confirm</button>
			<button id="presetObject-cancel" name="cancel">Cancel</button>
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
