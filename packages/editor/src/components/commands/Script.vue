<template>
	<WindowFrame id="script">
		<template #title><TitleBar
			>Script<div class="text hidden" id="script-mark">✱</div>
			<button id="script-change" name="script-change-ts">切换为TS</button>
			<div class="maximize" id="script-maximize" />
			<div class="close" />
		</TitleBar></template>
		
			<div class="box" id="script-script"> </div>
		
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
