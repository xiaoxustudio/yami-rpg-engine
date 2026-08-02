<template>
<WindowFrame id="stopEvent">
	<TitleBar>Stop Event<div class="close" /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Type</text><SelectBox id="stopEvent-type" /> <text>Actor</text
			><CustomBox id="stopEvent-actor" type="actor" /> <text>Skill</text
			><CustomBox id="stopEvent-skill" type="skill" /> <text>State</text
			><CustomBox id="stopEvent-state" type="state" /> <text>Equipment</text
			><CustomBox id="stopEvent-equipment" type="equipment" /> <text>Item</text
			><CustomBox id="stopEvent-item" type="item" /> <text>Light</text
			><CustomBox id="stopEvent-light" type="light" /> <text>Element</text
			><CustomBox id="stopEvent-element" type="element" /> <text>Event</text
			><CustomBox id="stopEvent-eventId" type="file" filter="event" />
			<text>Event</text><SelectBox id="stopEvent-eventType" />
		</grid-box>
		<button id="stopEvent-confirm" name="confirm">Confirm</button>
		<button id="stopEvent-cancel" name="cancel">Cancel</button>
	</content-frame>
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
