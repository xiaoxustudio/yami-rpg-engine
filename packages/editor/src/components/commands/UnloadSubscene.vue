<template>
	<WindowFrame id="unloadSubscene">
		<template #title><TitleBar>Unload Subscene<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Scene</div
				><FileVar id="unloadSubscene-sceneId" type="file" filter="scene" />
			</div>
		
	</WindowFrame>
	
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import FileVar from '@app/components/common/FileVar.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
