<template>
	<window-frame id="copyProgress">
		<title-bar>New Project</title-bar>
		<content-frame>
			<flex-box id="copyProgress-flex">
				<text>Copying Files...</text>
				<box id="copyProgress-box">
					<box id="copyProgress-bar" />
				</box>
				<text id="copyProgress-info" />
			</flex-box>
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
