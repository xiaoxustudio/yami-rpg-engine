<template>
	<!-- 设置文字效果 -->
	<WindowFrame id="textEffect">
		<TitleBar>Set Text Effect<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Effect</div><SelectBox id="textEffect-type" /> <div class="text">Shadow X</div
				><NumberBox id="textEffect-shadowOffsetX" min="-9" max="9" unit="px" />
				<div class="text">Shadow Y</div
				><NumberBox id="textEffect-shadowOffsetY" min="-9" max="9" unit="px" />
				<div class="text">Stroke Width</div
				><NumberBox id="textEffect-strokeWidth" min="1" max="20" unit="px" />
				<div class="text">Effect Color</div><ColorBox id="textEffect-color" />
			</div>
			<button id="textEffect-confirm" name="confirm">Confirm</button>
			<button id="textEffect-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
