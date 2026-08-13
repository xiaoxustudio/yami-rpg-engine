<template>
	<WindowFrame id="arrayList" mode="center">
		<template #title><TitleBar>Array<div class="close" /></TitleBar></template>
		
			<ParamList id="arrayList-list" @change="onListChange" />
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { ArrayList } from '@/tools/array-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import ParamList from '@app/components/common/ParamList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onListChange = () => {
	ArrayList?.listChange?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
