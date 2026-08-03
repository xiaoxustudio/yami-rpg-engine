<template>
	<WindowFrame id="copyProgress">
		<TitleBar>New Project</TitleBar>
		<div class="content-frame">
			<div class="flex-box" id="copyProgress-flex">
				<div class="text">Copying Files...</div>
				<div class="box" id="copyProgress-box">
					<div class="box" id="copyProgress-bar" />
				</div>
				<div class="text" id="copyProgress-info" />
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
