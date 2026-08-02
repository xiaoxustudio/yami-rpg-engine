<template>
	<WindowFrame id="enum" mode="center">
		<TitleBar>Enumeration<div class="close" /></TitleBar>
		<content-frame>
			<field-set id="enum-list-fieldset" class="input pad">
				<legend>List</legend>
				<TreeList id="enum-list" padded />
			</field-set>
			<field-set id="enum-properties-fieldset">
				<legend>Properties</legend>
				<flex-box id="enum-properties-flex">
					<flex-item
						><text>Name</text><TextBox id="enum-name" menu="tag-localization" /></flex-item
					>
					<flex-item
						><text>Value</text><TextBox id="enum-value" menu="tag-localization" /></flex-item
					>
					<flex-item id="enum-spacing-box" />
					<flex-item><text>Note</text><TextArea id="enum-note" /></flex-item>
				</flex-box>
			</field-set>
			<TextBox id="enum-searcher" name="search" />
			<button id="enum-confirm" name="confirm">Confirm</button>
			<button id="enum-cancel" name="cancel">Cancel</button>
			<button id="enum-apply" name="apply">Apply</button>
		</content-frame>
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
