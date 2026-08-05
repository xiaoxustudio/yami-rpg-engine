<template>
<WindowFrame id="forEach">
	<template #title><TitleBar>For Each<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Data</div><SelectBox id="forEach-data" /> <div class="text">List Variable</div
			><CustomBox id="forEach-list" type="variable" filter="object" />
			<div class="text">Actor</div><CustomBox id="forEach-actor" type="actor" />
			<div class="text">Parent Element</div><CustomBox id="forEach-element" type="element" />
			<div class="text">Attribute Group</div
			><CustomBox id="forEach-attribute-groupId" type="attribute-group" />
			<div class="text">Enum Group</div
			><CustomBox id="forEach-enum-groupId" type="enum-group" />
			<div class="text">Write to Variable</div
			><CustomBox id="forEach-variable" type="variable" filter="object" />
			<div class="text">Write Save Index</div
			><CustomBox id="forEach-saveIndex" type="variable" filter="number" />
			<div class="text">Touch Id</div
			><CustomBox id="forEach-touchId" type="variable" filter="number" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
