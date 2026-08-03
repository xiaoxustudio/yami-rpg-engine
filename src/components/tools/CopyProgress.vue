<template>
	<WindowFrame id="copyProgress">
		<TitleBar>New Project</TitleBar>
		<div class="content-frame">
			<div class="flex-box" id="copyProgress-flex">
				<text>Copying Files...</text>
				<box id="copyProgress-box">
					<box id="copyProgress-bar" />
				</box>
				<text id="copyProgress-info" />
			</div>
		</div>
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
