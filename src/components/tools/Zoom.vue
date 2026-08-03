<template>
	<!-- 缩放窗口 -->
	<WindowFrame id="zoom">
		<TitleBar>Zoom<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Zoom Factor</div
				><NumberBox id="zoom-factor" min="0.6666" max="2" decimals="4" />
			</div>
			<button id="zoom-confirm" name="confirm">Confirm</button>
			<button id="zoom-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import NumberBox from '@app/components/common/NumberBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
