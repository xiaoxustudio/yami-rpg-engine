<template>
	<WindowFrame id="edit-data">
		<template #title><TitleBar
			>edit data<div class="text hidden" id="edit-data-mark">✱</div>
			<div class="maximize" id="edit-data-maximize" />
			<div class="close" />
		</TitleBar></template>
		
			<div class="box" id="edit-data-current"> </div>
		
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
