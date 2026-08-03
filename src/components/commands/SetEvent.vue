<template>
<WindowFrame id="setEvent">
	<TitleBar>Set Event<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<div class="text">Operation</div><SelectBox id="setEvent-operation" />
			<div class="text">Variable</div
			><CustomBox id="setEvent-variable" type="variable" filter="object" />
			<div class="text">Event</div
			><CustomBox id="setEvent-eventId" type="file" filter="event" />
			<div class="text">Choice Index</div
			><NumberVar id="setEvent-choiceIndex" min="0" max="255" />
		</div>
		<button id="setEvent-confirm" name="confirm">Confirm</button>
		<button id="setEvent-cancel" name="cancel">Cancel</button>
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
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
