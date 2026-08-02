<template>
	<WindowFrame id="fileActor-skill">
		<TitleBar>Skill<close></close></TitleBar>
		<content-frame>
			<grid-box>
				<text>Skill</text
				><custom-box id="fileActor-skill-id" type="file" filter="skill" />
				<text>Shortcut Key</text><select-box id="fileActor-skill-key" />
			</grid-box>
			<button id="fileActor-skill-confirm" name="confirm">Confirm</button>
			<button id="fileActor-skill-cancel" name="cancel">Cancel</button>
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
