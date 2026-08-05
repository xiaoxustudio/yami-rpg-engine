<template>
<WindowFrame id="changeThreat">
	<template #title><TitleBar>Change Threat<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="changeThreat-actor" type="actor" /><div class="text">Target</div><CustomBox id="changeThreat-target" type="actor" /><div class="text">Operation</div><SelectBox id="changeThreat-operation" /><div class="text">Threat</div
			><NumberVar
				id="changeThreat-threat"
				min="0"
				max="1000000000"
				decimals="4"
			 /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from "@app/stores/inspector";
import { useLocalStore } from "@app/stores/local";
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
