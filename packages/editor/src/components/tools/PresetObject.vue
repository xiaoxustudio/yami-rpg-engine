<template>
		<WindowFrame id="presetObject" mode="center">
		<template #title><TitleBar>Object<div class="close"></div></TitleBar></template>
		
			<CustomBox
				id="presetObject-sceneId"
				type="file"
				filter="scene"
				@write="onSceneIdWrite"
			/>
			<TreeList id="presetObject-list" @open="onListOpen" />
			<TextBox id="presetObject-searcher" name="search" />
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onSceneIdWrite = (value: any) => {
	(window as any).PresetObject?.sceneIdWrite?.({ value });
};
const onListOpen = (event: any) => {
	(window as any).PresetObject?.listOpen?.(event);
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
