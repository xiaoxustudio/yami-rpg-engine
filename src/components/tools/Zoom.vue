<template>
	<!-- 缩放窗口 -->
	<window-frame id="zoom">
		<title-bar>Zoom<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Zoom Factor</text
				><number-box id="zoom-factor" min="0.6666" max="2" decimals="4" />
			</grid-box>
			<button id="zoom-confirm" name="confirm">Confirm</button>
			<button id="zoom-cancel" name="cancel">Cancel</button>
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
