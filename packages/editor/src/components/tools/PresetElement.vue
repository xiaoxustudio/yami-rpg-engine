<template>
		<WindowFrame id="presetElement" mode="center" @confirm="onConfirm">
		<template #title><TitleBar>Element<div class="close"></div></TitleBar></template>
		
			<CustomBox
				id="presetElement-uiId"
				type="file"
				filter="ui"
				@write="onUiIdWrite"
			/>
			<TreeList id="presetElement-list" @open="onListOpen" />
			<TextBox id="presetElement-searcher" name="search" @input="onSearcherInput" @compositionend="onSearcherInput" />
		
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
const onUiIdWrite = (value: unknown) => {
	PresetElement?.uiIdWrite?.({ value });
};
const onListOpen = (event: Event & { value?: unknown }) => {
	PresetElement?.listOpen?.(event);
};
const onSearcherInput = (value: string | Event) => {
	const text =
		typeof value === 'string'
			? value
			: ((value.target as HTMLInputElement | null)?.value ?? '');
	PresetElement?.searcherInput?.({ value: text });
};
const onConfirm = () => {
	PresetElement?.confirm?.();
};

const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
