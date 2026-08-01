<template>
	<window-frame id="actorGetter">
		<title-bar>Actor<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Type</text><select-box id="actorGetter-type" /> <text>Member ID</text
				><number-var id="actorGetter-memberId" min="0" max="10000" />
				<text>Actor</text
				><custom-box id="actorGetter-actorId" type="file" filter="actor" />
				<text>Data ID</text
				><custom-box id="actorGetter-presetId" type="preset-object" filter="actor" />
				<text>Variable</text
				><custom-box id="actorGetter-variable" type="variable" filter="object" />
			</grid-box>
			<button id="actorGetter-confirm" name="confirm">Confirm</button>
			<button id="actorGetter-cancel" name="cancel">Cancel</button>
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
