<template>
		<WindowFrame id="request-keyValue">
		<template #title><TitleBar>Header<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">key</div><StringVar id="request-keyValue-key" /> <div class="text">value</div
				><StringVar id="request-keyValue-value" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import StringVar from '@app/components/common/StringVar.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
