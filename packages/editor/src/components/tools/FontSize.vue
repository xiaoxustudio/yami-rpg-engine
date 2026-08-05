<template>
	<WindowFrame id="fontSize">
		<template #title><TitleBar>Set Font Size<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Size</div
				><NumberBox id="fontSize-size" min="10" max="400" unit="px" />
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
