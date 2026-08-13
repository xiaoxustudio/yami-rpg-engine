<template>
	<WindowFrame id="simulateKey" @confirm="onConfirm">
		<template #title><TitleBar>Simulate Key<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Operation</div><SelectBox id="simulateKey-operation" />
				<div class="text">Key Code</div><KeyboardBox id="simulateKey-keycode" />
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
import KeyboardBox from '@app/components/common/KeyboardBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.simulateKey?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
