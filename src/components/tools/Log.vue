<template>
	<window-frame id="log">
		<title-bar>Log<close></close></title-bar>
		<content-frame>
			<common-list id="log-list" />
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
