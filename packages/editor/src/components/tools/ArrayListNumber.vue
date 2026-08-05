<template>
	<WindowFrame id="arrayList-number">
		<template #title><TitleBar>Number<div class="close" /></TitleBar></template>
		
			<NumberBox
				id="arrayList-number-value"
				min="-1000000000"
				max="1000000000"
				decimals="10"
			/>
		
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
