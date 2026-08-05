<template>
<WindowFrame id="createActor">
	<template #title><TitleBar>Create Actor<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div
			><CustomBox id="createActor-actorId" type="file" filter="actor" /><div class="text">Team</div><SelectBox id="createActor-teamId" /><div class="text">Position</div
			><CustomBox id="createActor-position" type="position" /><div class="text">Angle</div
			><NumberVar
				id="createActor-angle"
				min="-360"
				max="360"
				decimals="4"
				unit="deg"
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
