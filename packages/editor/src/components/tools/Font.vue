<template>
	<WindowFrame id="font" @confirm="onConfirm">
		<template #title><TitleBar>Set Font<div class="close"></div></TitleBar></template>
		
			<div class="grid-box"> <div class="text">Font Family</div><TextBox id="font-font" /> </div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Selection } from '@/tools/text-capture.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TextBox from '@app/components/common/TextBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Selection?.font?.confirm?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
