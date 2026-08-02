<template>
<WindowFrame id="setEvent">
	<TitleBar>Set Event<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Operation</text><select-box id="setEvent-operation" />
			<text>Variable</text
			><custom-box id="setEvent-variable" type="variable" filter="object" />
			<text>Event</text
			><custom-box id="setEvent-eventId" type="file" filter="event" />
			<text>Choice Index</text
			><number-var id="setEvent-choiceIndex" min="0" max="255" />
		</grid-box>
		<button id="setEvent-confirm" name="confirm">Confirm</button>
		<button id="setEvent-cancel" name="cancel">Cancel</button>
	</content-frame>
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
