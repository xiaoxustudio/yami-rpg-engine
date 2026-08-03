<template>
			<div class="page-frame" id="animation-easing" value="animation-easing">
				<div class="box" id="animation-easing-head">
					<div class="item toolbar-item" id="animation-easing-settings" value="bezier" />
					<SelectBox id="animation-easing-id" />
				</div>
				<canvas id="animation-easing-canvas" width="0" height="0"></canvas>
			</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
