<template>
<WindowFrame id="detectTargets">
	<template #title><TitleBar>Detect Targets<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="detectTargets-actor" type="actor" /><div class="text">Distance</div
			><NumberVar
				id="detectTargets-distance"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
			 /><div class="text">Selector</div><SelectBox id="detectTargets-selector" /><div class="text">In Sight</div><SelectBox id="detectTargets-inSight" /></div>
	
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
