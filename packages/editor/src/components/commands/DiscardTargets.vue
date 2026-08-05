<template>
<WindowFrame id="discardTargets">
	<template #title><TitleBar>Discard Targets<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="discardTargets-actor" type="actor" /><div class="text">Selector</div><SelectBox id="discardTargets-selector" /><div class="text">Distance</div
			><NumberVar
				id="discardTargets-distance"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
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
