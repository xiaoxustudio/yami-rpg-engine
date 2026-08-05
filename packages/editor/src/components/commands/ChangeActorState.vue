<template>
<WindowFrame id="changeActorState">
	<template #title><TitleBar>Change Actor State<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="changeActorState-actor" type="actor" /><div class="text">Operation</div><SelectBox id="changeActorState-operation" /><div class="text">State</div
			><CustomBox id="changeActorState-stateId" type="file" filter="state" /><div class="text">State</div><CustomBox id="changeActorState-state" type="state" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from "@app/stores/inspector";
import { useLocalStore } from "@app/stores/local";
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
