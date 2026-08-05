<template>
	<WindowFrame id="nestElement">
		<template #title><TitleBar>Nest Element<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Parent Element</div
				><CustomBox id="nestElement-parent" type="element" />
				<div class="text">Child Element</div
				><CustomBox id="nestElement-child" type="element" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
