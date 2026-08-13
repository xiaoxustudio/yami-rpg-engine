<template>
		<WindowFrame id="setKey" @confirm="onConfirm">
		<template #title><TitleBar>Set Key<div class="close"></div></TitleBar></template>
		
			<div class="grid-box"> <div class="text">Key</div><TextBox id="setKey-key" /> </div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { SetKey } from '@/tools/set-key-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TextBox from '@app/components/common/TextBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	SetKey?.confirm?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
