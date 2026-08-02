<template>
	<WindowFrame id="castSkill">
		<TitleBar>Cast Skill<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Actor</text><custom-box id="castSkill-actor" type="actor" />
				<text>Mode</text><select-box id="castSkill-mode" /> <text>Shortcut Key</text
				><select-box id="castSkill-key" /> <text>Shortcut Key</text
				><string-var id="castSkill-keyVar" /> <text>Skill</text
				><custom-box id="castSkill-skillId" type="file" filter="skill" />
				<text>Skill</text><custom-box id="castSkill-skill" type="skill" />
				<text>Wait</text><select-box id="castSkill-wait" name="wait" />
			</grid-box>
			<button id="castSkill-confirm" name="confirm">Confirm</button>
			<button id="castSkill-cancel" name="cancel">Cancel</button>
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
