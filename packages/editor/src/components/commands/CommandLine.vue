<template>
	<WindowFrame id="commandLine" @confirm="onConfirm">
		<template #title><TitleBar>Command Line<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="commandLine-type" /> <div class="text">Key</div
				><StringVar id="commandLine-key" /> <div class="text">Value</div
				><StringVar id="commandLine-value" /> <div class="text">Variable</div
				><CustomBox id="commandLine-variable" type="variable" filter="object" />
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
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.commandLine?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
