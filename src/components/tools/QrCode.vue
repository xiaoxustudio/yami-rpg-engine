<template>
		<window-frame id="qr-code">
		<title-bar>本地服务预览<close></close></title-bar>
		<content-frame>
			<box>
				<box id="qr-img-container"><img id="qr-code-img" /></box><br />
				<box id="qr-code-content" />
			</box>
			<button id="qr-start-button" name="start-qr-code" />
			<button id="qr-close-button" name="close-qr-code" />
			<button id="qr-update-button" name="update-qr-code" />
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
