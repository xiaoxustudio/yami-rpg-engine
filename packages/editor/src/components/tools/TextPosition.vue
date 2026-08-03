<template>
	<!-- 设置文字位置 -->
	<WindowFrame id="textPosition">
		<TitleBar>Set Text Position<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Axis</div><SelectBox id="textPosition-axis" /> <div class="text">Operation</div
				><SelectBox id="textPosition-operation" /> <div class="text">Value</div
				><NumberBox id="textPosition-value" min="-1000" max="1000" unit="px" />
			</div>
			<button id="textPosition-confirm" name="confirm">Confirm</button>
			<button id="textPosition-cancel" name="cancel">Cancel</button>
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
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
