<template>
		<window-frame id="presetElement" mode="center">
		<title-bar>Element<close></close></title-bar>
		<content-frame>
			<custom-box id="presetElement-uiId" type="file" filter="ui" />
			<node-list id="presetElement-list" />
			<text-box id="presetElement-searcher" name="search" />
			<button id="presetElement-confirm" name="confirm">Confirm</button>
			<button id="presetElement-cancel" name="cancel">Cancel</button>
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
