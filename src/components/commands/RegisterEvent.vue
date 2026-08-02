<template>
<WindowFrame id="registerEvent">
	<TitleBar>Register Event<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Target</text><select-box id="registerEvent-target" /> <text>Actor</text
			><custom-box id="registerEvent-actor" type="actor" /> <text>Element</text
			><custom-box id="registerEvent-element" type="element" />
			<text>Operation</text><select-box id="registerEvent-operation" />
			<text>Type</text><select-box id="registerEvent-type" /> <text>Priority</text
			><check-box id="registerEvent-priority" class="standard large" />
			<text>Namespace</text
			><check-box id="registerEvent-namespace" class="standard large" />
			<text>Tag Name</text><string-var id="registerEvent-tag" />
		</grid-box>
		<button id="registerEvent-confirm" name="confirm">Confirm</button>
		<button id="registerEvent-cancel" name="cancel">Cancel</button>
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
