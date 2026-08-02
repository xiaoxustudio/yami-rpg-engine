<template>
		<WindowFrame id="qr-code">
		<TitleBar>本地服务预览<close></close></TitleBar>
		<content-frame>
			<box>
				<box id="qr-img-container"><img id="qr-code-img" /></box><br />
				<box id="qr-code-content" />
			</box>
			<button id="qr-start-button" name="start-qr-code" />
			<button id="qr-close-button" name="close-qr-code" />
			<button id="qr-update-button" name="update-qr-code" />
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
