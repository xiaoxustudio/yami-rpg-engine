<template>
	<WindowFrame id="clampCamera">
		<TitleBar>Clamp Camera<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Left</div
				><NumberVar
					id="clampCamera-left"
					min="-1000"
					max="1000"
					step="0.1"
					decimals="4"
				 />
				<div class="text">Top</div
				><NumberVar
					id="clampCamera-top"
					min="-1000"
					max="1000"
					step="0.1"
					decimals="4"
				 />
				<div class="text">Right</div
				><NumberVar
					id="clampCamera-right"
					min="-1000"
					max="1000"
					step="0.1"
					decimals="4"
				 />
				<div class="text">Bottom</div
				><NumberVar
					id="clampCamera-bottom"
					min="-1000"
					max="1000"
					step="0.1"
					decimals="4"
				 />
			</div>
			<button id="clampCamera-confirm" name="confirm">Confirm</button>
			<button id="clampCamera-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
	
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import NumberVar from '@app/components/common/NumberVar.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
