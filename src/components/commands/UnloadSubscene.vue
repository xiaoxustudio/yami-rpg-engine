<template>
	<WindowFrame id="unloadSubscene">
		<TitleBar>Unload Subscene<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>Scene</text
				><FileVar id="unloadSubscene-sceneId" type="file" filter="scene" />
			</div>
			<button id="unloadSubscene-confirm" name="confirm">Confirm</button>
			<button id="unloadSubscene-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
	
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
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
