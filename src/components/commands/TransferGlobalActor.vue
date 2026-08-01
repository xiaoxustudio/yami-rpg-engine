<template>
<window-frame id="transferGlobalActor">
	<title-bar>Transfer Global Actor<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="transferGlobalActor-actor" type="actor" />
			<text>Position</text
			><custom-box id="transferGlobalActor-position" type="position" />
		</grid-box>
		<button id="transferGlobalActor-confirm" name="confirm">Confirm</button>
		<button id="transferGlobalActor-cancel" name="cancel">Cancel</button>
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
