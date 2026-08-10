<template>
<WindowFrame id="callEvent">
	<template #title><TitleBar>Call Event<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Type</div
			><SelectBox id="callEvent-type" @write="onTypeWrite" /> <div class="text">Actor</div
			><CustomBox id="callEvent-actor" type="actor" /> <div class="text">Skill</div
			><CustomBox id="callEvent-skill" type="skill" /> <div class="text">State</div
			><CustomBox id="callEvent-state" type="state" /> <div class="text">Equipment</div
			><CustomBox id="callEvent-equipment" type="equipment" /> <div class="text">Item</div
			><CustomBox id="callEvent-item" type="item" /> <div class="text">Light</div
			><CustomBox id="callEvent-light" type="light" /> <div class="text">Element</div
			><CustomBox id="callEvent-element" type="element" /> <div class="text">Event</div
			><CustomBox
				id="callEvent-eventId"
				type="file"
				filter="event"
				@write="onEventIdWrite"
				@input="onEventIdInput"
			/>
			<div class="text">Event</div><SelectBox id="callEvent-eventType" />
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
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onTypeWrite = (value: any) => {
	Command?.cases?.callEvent?.typeWrite?.({ value });
};
const onEventIdWrite = (value: any) => {
	Command?.cases?.callEvent?.eventIdWrite?.({ value });
};
const onEventIdInput = (value: any) => {
	Command?.cases?.callEvent?.eventIdInput?.({ value });
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
