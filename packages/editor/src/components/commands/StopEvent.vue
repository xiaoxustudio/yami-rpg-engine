<template>
<WindowFrame id="stopEvent">
	<template #title><TitleBar>Stop Event<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Type</div><SelectBox id="stopEvent-type" @write="onWrite" /> <div class="text">Actor</div
			><CustomBox id="stopEvent-actor" type="actor" /> <div class="text">Skill</div
			><CustomBox id="stopEvent-skill" type="skill" /> <div class="text">State</div
			><CustomBox id="stopEvent-state" type="state" /> <div class="text">Equipment</div
			><CustomBox id="stopEvent-equipment" type="equipment" /> <div class="text">Item</div
			><CustomBox id="stopEvent-item" type="item" /> <div class="text">Light</div
			><CustomBox id="stopEvent-light" type="light" /> <div class="text">Element</div
			><CustomBox id="stopEvent-element" type="element" /> <div class="text">Event</div
			><CustomBox id="stopEvent-eventId" type="file" filter="event" />
			<div class="text">Event</div><SelectBox id="stopEvent-eventType" />
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
const onWrite = (value: any) => {
	(window as any).Command?.cases?.stopEvent?.writeHandler?.({ value });
};

const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
