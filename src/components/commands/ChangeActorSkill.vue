<template>
<WindowFrame id="changeActorSkill">
	<TitleBar>Change Actor Skill<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<text>Actor</text><CustomBox id="changeActorSkill-actor" type="actor" /><text>Operation</text><SelectBox id="changeActorSkill-operation" /><text>Skill</text
			><FileVar id="changeActorSkill-skillId" type="file" filter="skill" /><text>Skill</text><CustomBox id="changeActorSkill-skill" type="skill" /></div>
		<button id="changeActorSkill-confirm" name="confirm">Confirm</button>
		<button id="changeActorSkill-cancel" name="cancel">Cancel</button>
	</div>
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from "@app/stores/inspector";
import { useLocalStore } from "@app/stores/local";
import CustomBox from '@app/components/common/CustomBox.vue';
import FileVar from '@app/components/common/FileVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
