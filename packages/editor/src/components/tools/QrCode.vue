<template>
		<WindowFrame id="qr-code">
		<TitleBar>本地服务预览<div class="close"></div></TitleBar>
		<div class="content-frame">
			<div class="box">
				<div class="box" id="qr-img-container"><img id="qr-code-img" /></div><br />
				<div class="box" id="qr-code-content" />
			</div>
			<button id="qr-start-button" name="start-qr-code" />
			<button id="qr-close-button" name="close-qr-code" />
			<button id="qr-update-button" name="update-qr-code" />
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
