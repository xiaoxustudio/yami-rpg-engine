<template>
	<window-frame id="enum" mode="center">
		<title-bar>Enumeration<close /></title-bar>
		<content-frame>
			<field-set id="enum-list-fieldset" class="input pad">
				<legend>List</legend>
				<node-list id="enum-list" padded />
			</field-set>
			<field-set id="enum-properties-fieldset">
				<legend>Properties</legend>
				<flex-box id="enum-properties-flex">
					<flex-item
						><text>Name</text><text-box id="enum-name" menu="tag-localization" /></flex-item
					>
					<flex-item
						><text>Value</text><text-box id="enum-value" menu="tag-localization" /></flex-item
					>
					<flex-item id="enum-spacing-box" />
					<flex-item><text>Note</text><text-area id="enum-note" /></flex-item>
				</flex-box>
			</field-set>
			<text-box id="enum-searcher" name="search" />
			<button id="enum-confirm" name="confirm">Confirm</button>
			<button id="enum-cancel" name="cancel">Cancel</button>
			<button id="enum-apply" name="apply">Apply</button>
		</content-frame>
	</window-frame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
