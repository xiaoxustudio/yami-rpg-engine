<template>
	<WindowFrame id="enum" show-apply mode="center">
		<template #title><TitleBar>Enumeration<div class="close" /></TitleBar></template>
		
			<div class="field-set input pad" id="enum-list-fieldset">
				<div class="legend">List</div>
				<TreeList id="enum-list" padded />
			</div>
			<div class="field-set" id="enum-properties-fieldset">
				<div class="legend">Properties</div>
				<div class="flex-box" id="enum-properties-flex">
					<div class="flex-item"
						><div class="text">Name</div><TextBox id="enum-name" menu="tag-localization" /></div>
					<div class="flex-item"
						><div class="text">Value</div><TextBox id="enum-value" menu="tag-localization" /></div>
					<div class="flex-item" id="enum-spacing-box" />
					<div class="flex-item"><div class="text">Note</div><TextArea id="enum-note" /></div>
				</div>
			</div>
			<TextBox id="enum-searcher" name="search" />
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
