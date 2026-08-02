<template>
	<!-- 进度窗口 -->
	<WindowFrame id="windowProgress">
		<TitleBar>进度</TitleBar>
		<content-frame>
			<flex-box id="windowProgress-flex">
				<text id="windowProgress-info" />
			</flex-box>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
