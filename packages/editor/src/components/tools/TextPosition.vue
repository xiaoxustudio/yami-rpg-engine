<template>
	<!-- 设置文字位置 -->
	<WindowFrame id="textPosition" @confirm="onConfirm">
		<template #title><TitleBar>Set Text Position<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Axis</div><SelectBox id="textPosition-axis" /> <div class="text">Operation</div
				><SelectBox id="textPosition-operation" /> <div class="text">Value</div
				><NumberBox id="textPosition-value" min="-1000" max="1000" unit="px" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Selection } from '@/tools/text-capture.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Selection?.textPosition?.confirm?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
