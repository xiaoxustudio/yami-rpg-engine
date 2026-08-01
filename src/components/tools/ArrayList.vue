<template>
	<window-frame id="arrayList" mode="center">
		<title-bar>Array<close /></title-bar>
		<content-frame>
			<param-list id="arrayList-list" />
			<button id="arrayList-confirm" name="confirm">Confirm</button>
			<button id="arrayList-cancel" name="cancel">Cancel</button>
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
