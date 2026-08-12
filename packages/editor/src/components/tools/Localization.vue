<template>
	<WindowFrame id="localization" show-apply mode="center">
		<template #title><TitleBar>Localization<div class="close"></div></TitleBar></template>
		
			<div class="field-set input pad" id="localization-list-fieldset">
				<div class="legend">List</div>
				<TreeList
					id="localization-list"
					padded
					@select="onListSelect"
					@record="onListRecord"
					@open="onListOpen"
					@popup="onListPopup"
				/>
			</div>
			<div class="box" id="localization-inspector" />
			<TextBox id="localization-searcher" name="search" />
			<button id="localization-from-excel" name="from-excel">from-excel</button>
			<button id="localization-to-excel" name="to-excel">to-excel</button>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Localization } from '@/local/local-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onListSelect = (event: Event & { value?: unknown }) => {
	Localization?.listSelect?.(event);
};
const onListRecord = (event: Event & { value?: unknown }) => {
	Localization?.listRecord?.(event);
};
const onListOpen = (event: Event & { value?: unknown }) => {
	Localization?.listOpen?.(event);
};
const onListPopup = (event: PointerEvent & { value?: unknown }) => {
	Localization?.listPopup?.(event);
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
