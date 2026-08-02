<template>
	<!-- 设置文字效果 -->
	<WindowFrame id="textEffect">
		<TitleBar>Set Text Effect<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Effect</text><select-box id="textEffect-type" /> <text>Shadow X</text
				><number-box id="textEffect-shadowOffsetX" min="-9" max="9" unit="px" />
				<text>Shadow Y</text
				><number-box id="textEffect-shadowOffsetY" min="-9" max="9" unit="px" />
				<text>Stroke Width</text
				><number-box id="textEffect-strokeWidth" min="1" max="20" unit="px" />
				<text>Effect Color</text><color-box id="textEffect-color" />
			</grid-box>
			<button id="textEffect-confirm" name="confirm">Confirm</button>
			<button id="textEffect-cancel" name="cancel">Cancel</button>
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
