<template>
	<!-- 进度窗口 -->
	<window-frame id="windowProgress">
		<title-bar>进度</title-bar>
		<content-frame>
			<flex-box id="windowProgress-flex">
				<text id="windowProgress-info" />
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
