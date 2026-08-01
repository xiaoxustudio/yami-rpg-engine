<template>
	<window-frame id="setSkill">
		<title-bar>Set Skill<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Skill</text><custom-box id="setSkill-skill" type="skill" />
				<text>Operation</text><select-box id="setSkill-operation" />
				<text>Cooldown</text
				><number-var id="setSkill-cooldown" min="1" max="3600000" unit="ms" />
			</grid-box>
			<button id="setSkill-confirm" name="confirm">Confirm</button>
			<button id="setSkill-cancel" name="cancel">Cancel</button>
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
