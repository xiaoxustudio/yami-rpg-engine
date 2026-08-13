<template>
<WindowFrame id="useItem" @confirm="onConfirm">
	<template #title><TitleBar>Use Item<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="useItem-actor" type="actor" />
			<div class="text">Mode</div><SelectBox id="useItem-mode" /> <div class="text">Shortcut Key</div
			><SelectBox id="useItem-key" /> <div class="text">Item</div
			><CustomBox id="useItem-itemId" type="file" filter="item" />
			<div class="text">Item</div><CustomBox id="useItem-item" type="item" />
			<div class="text">Wait</div><SelectBox id="useItem-wait" name="wait" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.useItem?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
