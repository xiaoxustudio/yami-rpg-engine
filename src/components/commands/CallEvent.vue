<template>
<WindowFrame id="callEvent">
	<TitleBar>Call Event<div class="close" /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Type</text><SelectBox id="callEvent-type" /> <text>Actor</text
			><CustomBox id="callEvent-actor" type="actor" /> <text>Skill</text
			><CustomBox id="callEvent-skill" type="skill" /> <text>State</text
			><CustomBox id="callEvent-state" type="state" /> <text>Equipment</text
			><CustomBox id="callEvent-equipment" type="equipment" /> <text>Item</text
			><CustomBox id="callEvent-item" type="item" /> <text>Light</text
			><CustomBox id="callEvent-light" type="light" /> <text>Element</text
			><CustomBox id="callEvent-element" type="element" /> <text>Event</text
			><CustomBox id="callEvent-eventId" type="file" filter="event" />
			<text>Event</text><SelectBox id="callEvent-eventType" />
		</grid-box>
		<button id="callEvent-confirm" name="confirm">Confirm</button>
		<button id="callEvent-cancel" name="cancel">Cancel</button>
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
