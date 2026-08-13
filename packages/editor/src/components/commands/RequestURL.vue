<template>
<WindowFrame id="requestURL" @confirm="onConfirm">
	<template #title><TitleBar>requestURL<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">URL</div><StringVar id="requestURL-url" /> <div class="text">Header</div
			><ParamList id="requestURL-header" /> <div class="text">Method</div
			><SelectBox id="requestURL-method" /> <div class="text">Data</div
			><ParamList id="requestURL-data" /> <div class="text">CallBack</div
			><CustomBox id="requestURL-callback" type="file" filter="event" />
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
import ParamList from '@app/components/common/ParamList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.requestURL?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
