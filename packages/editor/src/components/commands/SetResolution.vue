<template>
	<WindowFrame id="setResolution">
		<template #title><TitleBar>Set Resolution<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Width</div
				><NumberVar id="setResolution-width" min="240" max="7680" unit="px" />
				<div class="text">Height</div
				><NumberVar id="setResolution-height" min="240" max="7680" unit="px" />
				<div class="text">Scene Scale</div
				><NumberVar id="setResolution-sceneScale" min="0.5" max="4" decimals="10" />
				<div class="text">UI Scale</div
				><NumberVar id="setResolution-uiScale" min="0.5" max="4" decimals="10" />
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
import NumberVar from '@app/components/common/NumberVar.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
