<template>
<window-frame id="callEvent">
	<title-bar>Call Event<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Type</text><select-box id="callEvent-type" /> <text>Actor</text
			><custom-box id="callEvent-actor" type="actor" /> <text>Skill</text
			><custom-box id="callEvent-skill" type="skill" /> <text>State</text
			><custom-box id="callEvent-state" type="state" /> <text>Equipment</text
			><custom-box id="callEvent-equipment" type="equipment" /> <text>Item</text
			><custom-box id="callEvent-item" type="item" /> <text>Light</text
			><custom-box id="callEvent-light" type="light" /> <text>Element</text
			><custom-box id="callEvent-element" type="element" /> <text>Event</text
			><custom-box id="callEvent-eventId" type="file" filter="event" />
			<text>Event</text><select-box id="callEvent-eventType" />
		</grid-box>
		<button id="callEvent-confirm" name="confirm">Confirm</button>
		<button id="callEvent-cancel" name="cancel">Cancel</button>
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
