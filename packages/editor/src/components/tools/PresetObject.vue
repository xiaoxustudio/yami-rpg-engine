<template>
		<WindowFrame id="presetObject" mode="center" @confirm="onConfirm">
		<template #title><TitleBar>Object<div class="close"></div></TitleBar></template>
		
			<CustomBox
				id="presetObject-sceneId"
				type="file"
				filter="scene"
				@write="onSceneIdWrite"
			/>
			<TreeList id="presetObject-list" @open="onListOpen" />
			<TextBox id="presetObject-searcher" name="search" @input="onSearcherInput" @compositionend="onSearcherInput" />
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { PresetObject } from '@/tools/scene-preset-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onSceneIdWrite = (value: unknown) => {
	PresetObject?.sceneIdWrite?.({ value });
};
const onListOpen = (event: Event & { value?: unknown }) => {
	PresetObject?.listOpen?.(event);
};
const onSearcherInput = (value: string | Event) => {
	const text =
		typeof value === 'string'
			? value
			: ((value.target as HTMLInputElement | null)?.value ?? '');
	PresetObject?.searcherInput?.({ value: text });
};
const onConfirm = () => {
	PresetObject?.confirm?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
