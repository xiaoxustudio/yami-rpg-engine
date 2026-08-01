<template>
	<window-frame id="fileActor-skill">
		<title-bar>Skill<close></close></title-bar>
		<content-frame>
			<grid-box>
				<text>Skill</text
				><custom-box id="fileActor-skill-id" type="file" filter="skill" />
				<text>Shortcut Key</text><select-box id="fileActor-skill-key" />
			</grid-box>
			<button id="fileActor-skill-confirm" name="confirm">Confirm</button>
			<button id="fileActor-skill-cancel" name="cancel">Cancel</button>
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
