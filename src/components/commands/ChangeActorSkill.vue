<template>
<WindowFrame id="changeActorSkill">
	<TitleBar>Change Actor Skill<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="changeActorSkill-actor" type="actor" /><text>Operation</text><select-box id="changeActorSkill-operation" /><text>Skill</text
			><file-var id="changeActorSkill-skillId" type="file" filter="skill" /><text>Skill</text><custom-box id="changeActorSkill-skill" type="skill" /></grid-box>
		<button id="changeActorSkill-confirm" name="confirm">Confirm</button>
		<button id="changeActorSkill-cancel" name="cancel">Cancel</button>
	</content-frame>
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from "@app/stores/inspector";
import { useLocalStore } from "@app/stores/local";

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
