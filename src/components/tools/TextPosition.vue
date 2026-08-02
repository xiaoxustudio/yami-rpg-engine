<template>
	<!-- 设置文字位置 -->
	<WindowFrame id="textPosition">
		<TitleBar>Set Text Position<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Axis</text><select-box id="textPosition-axis" /> <text>Operation</text
				><select-box id="textPosition-operation" /> <text>Value</text
				><number-box id="textPosition-value" min="-1000" max="1000" unit="px" />
			</grid-box>
			<button id="textPosition-confirm" name="confirm">Confirm</button>
			<button id="textPosition-cancel" name="cancel">Cancel</button>
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
