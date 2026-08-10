<template>
		<WindowFrame id="presetElement" mode="center">
		<template #title><TitleBar>Element<div class="close"></div></TitleBar></template>
		
			<CustomBox
				id="presetElement-uiId"
				type="file"
				filter="ui"
				@write="onUiIdWrite"
			/>
			<TreeList id="presetElement-list" @open="onListOpen" />
			<TextBox id="presetElement-searcher" name="search" />
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { PresetElement } from '@/tools/preset-element-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const onUiIdWrite = (value: any) => {
	PresetElement?.uiIdWrite?.({ value });
};
const onListOpen = (event: any) => {
	PresetElement?.listOpen?.(event);
};

const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
