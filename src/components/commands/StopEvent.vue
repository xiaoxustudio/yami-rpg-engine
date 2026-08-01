<template>
<window-frame id="stopEvent">
	<title-bar>Stop Event<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Type</text><select-box id="stopEvent-type" /> <text>Actor</text
			><custom-box id="stopEvent-actor" type="actor" /> <text>Skill</text
			><custom-box id="stopEvent-skill" type="skill" /> <text>State</text
			><custom-box id="stopEvent-state" type="state" /> <text>Equipment</text
			><custom-box id="stopEvent-equipment" type="equipment" /> <text>Item</text
			><custom-box id="stopEvent-item" type="item" /> <text>Light</text
			><custom-box id="stopEvent-light" type="light" /> <text>Element</text
			><custom-box id="stopEvent-element" type="element" /> <text>Event</text
			><custom-box id="stopEvent-eventId" type="file" filter="event" />
			<text>Event</text><select-box id="stopEvent-eventType" />
		</grid-box>
		<button id="stopEvent-confirm" name="confirm">Confirm</button>
		<button id="stopEvent-cancel" name="cancel">Cancel</button>
	</content-frame>
</window-frame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
